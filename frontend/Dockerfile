# Multi-stage build optimizado para Next.js 15
# Autor: DevOps Senior
# Estrategia: Separar deps, build y runner para máximo cache

# ============================================
# Stage 1: Dependencies (cacheable)
# ============================================
FROM node:20-alpine AS deps

WORKDIR /app

# Copiar SOLAMENTE package files (maximiza cache de Docker layer)
# Si package.json cambia pero package-lock.json no, npm ci usa cache
COPY package*.json ./

# Configurar npm para mayor resiliencia de red (evita ECONNRESET en Docker/Windows)
RUN npm config set prefer-online true && \
    npm config set fetch-retries 5 && \
    npm config set fetch-retry-mintimeout 20000 && \
    npm config set fetch-retry-maxtimeout 120000

# Instalar dependencias de forma reproducible
# npm ci es más rápido y confiable que npm install
RUN npm ci --ignore-scripts && \
    npm cache clean --force

# ============================================
# Stage 2: Builder
# ============================================
FROM node:20-alpine AS builder

WORKDIR /app

# ARG para recibir variables de entorno en tiempo de build
# Las variables NEXT_PUBLIC_* se "queman" en el build de Next.js
ARG NEXT_PUBLIC_API_URL
ENV NEXT_PUBLIC_API_URL=${NEXT_PUBLIC_API_URL}

# Copiar node_modules desde stage deps (evita reinstalar)
COPY --from=deps /app/node_modules ./node_modules

# Copiar resto del código (esta capa invalida cache si cambia código fuente)
COPY . .

# Configurar variables de entorno para build
# NEXT_TELEMETRY_DISABLED=1 evita llamadas a Vercel durante build
ENV NEXT_TELEMETRY_DISABLED=1
ENV NODE_ENV=production

# Build de Next.js con output standalone
# Esto crea una carpeta .next/standalone con todo lo necesario
# Aumentar memoria para Node.js en builds grandes
ENV NODE_OPTIONS="--max-old-space-size=4096"
RUN npm run build || (echo "Build failed, showing error details:" && exit 1)

# ============================================
# Stage 3: Production Runner
# ============================================
FROM node:20-alpine AS runner

WORKDIR /app

# Configurar entorno de producción
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

# Crear usuario no-root (security best practice)
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nextjs

# Copiar archivos necesarios desde builder
# NOTA: El orden importa para optimizar capas
COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/package*.json ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

# Crear directorio para descargas locales (si aplica)
RUN mkdir -p /app/downloads && \
    chown -R nextjs:nodejs /app/downloads

# Cambiar a usuario no-root
USER nextjs

# Health check (para orchestradores como Coolify, Kubernetes, etc)
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
    CMD wget --no-verbose --tries=1 --spider http://localhost:3000 || exit 1

EXPOSE 3000

# Iniciar aplicación
# server.js viene del build standalone de Next.js
CMD ["node", "server.js"]
