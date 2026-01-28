# Multi-stage build optimizado para NestJS Backend
# Estrategia: Usar Debian slim para compatibilidad con Prisma/OpenSSL

# ============================================
# Stage 1: Dependencies (cacheable)
# ============================================
FROM node:20-slim AS deps

WORKDIR /app

# Instalar OpenSSL (requerido por Prisma)
RUN apt-get update && apt-get install -y openssl && \
    rm -rf /var/lib/apt/lists/*

# Copiar SOLAMENTE package files y prisma schema (maximiza cache)
COPY package*.json ./
COPY prisma ./prisma/

# Configurar npm para mayor resiliencia de red (evita ECONNRESET en Docker/Windows)
RUN npm config set prefer-online true && \
    npm config set fetch-retries 5 && \
    npm config set fetch-retry-mintimeout 20000 && \
    npm config set fetch-retry-maxtimeout 120000

# Instalar dependencias de forma reproducible
RUN npm ci && npm cache clean --force

# Generar Prisma client
RUN npx prisma generate

# ============================================
# Stage 2: Builder
# ============================================
FROM node:20-slim AS builder

WORKDIR /app

# Instalar OpenSSL
RUN apt-get update && apt-get install -y openssl && \
    rm -rf /var/lib/apt/lists/*

# Copiar node_modules y prisma desde stage deps
COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/prisma ./prisma/
COPY package*.json ./

# Copiar codigo fuente
COPY . .

# Regenerar Prisma client (por si acaso)
RUN npx prisma generate

# Compilar TypeScript a JavaScript
RUN npm run build

# ============================================
# Stage 3: Production Runner
# ============================================
FROM node:20-slim AS production

WORKDIR /app

# Configurar entorno de produccion
ENV NODE_ENV=production
ENV PORT=3001
ENV DOWNLOAD_PATH=/app/downloads
# Configurar deno para yt-dlp
ENV DENO_DIR=/tmp/deno
ENV PATH="/usr/local/bin:${PATH}"

# Instalar dependencias del sistema:
# - openssl: requerido por Prisma
# - curl: para healthcheck
# - ffmpeg: para procesar/convertir audio y video
# - python3: requerido por yt-dlp
# - unzip: para instalar deno
# - yt-dlp: para descargar videos de YouTube y otras plataformas
# - deno: runtime JavaScript requerido por yt-dlp para YouTube
RUN apt-get update && apt-get install -y \
    openssl \
    curl \
    ffmpeg \
    python3 \
    unzip \
    ca-certificates \
    && curl -L https://github.com/yt-dlp/yt-dlp/releases/latest/download/yt-dlp -o /usr/local/bin/yt-dlp \
    && chmod a+rx /usr/local/bin/yt-dlp \
    && curl -fsSL https://github.com/denoland/deno/releases/latest/download/deno-x86_64-unknown-linux-gnu.zip -o /tmp/deno.zip \
    && unzip /tmp/deno.zip -d /usr/local/bin \
    && chmod a+rx /usr/local/bin/deno \
    && rm /tmp/deno.zip \
    && mkdir -p /tmp/deno \
    && chmod 777 /tmp/deno \
    && rm -rf /var/lib/apt/lists/*

# Crear usuario no-root (security best practice)
RUN groupadd --system --gid 1001 nodejs && \
    useradd --system --uid 1001 --gid nodejs nestjs

# Copiar package files y prisma
COPY package*.json ./
COPY prisma ./prisma/

# Configurar npm para mayor resiliencia de red
RUN npm config set prefer-online true && \
    npm config set fetch-retries 5 && \
    npm config set fetch-retry-mintimeout 20000 && \
    npm config set fetch-retry-maxtimeout 120000

# Instalar dependencias de produccion y generar Prisma
RUN npm ci --omit=dev && \
    npx prisma generate && \
    npm cache clean --force

# Copiar archivos compilados desde builder
COPY --from=builder --chown=nestjs:nodejs /app/dist ./dist
COPY --from=builder --chown=nestjs:nodejs /app/node_modules/.prisma ./node_modules/.prisma

# Crear directorios de descargas y cookies con permisos correctos
RUN mkdir -p /app/downloads /app/cookies && \
    chown -R nestjs:nodejs /app/downloads /app/cookies

# Cambiar a usuario no-root
USER nestjs

EXPOSE 3001

# Health check (tolerante al startup de NestJS + Prisma + Redis)
# start-period=60s: tiempo para que el backend arranque sin penalizar
# interval=10s: verificacion frecuente una vez iniciado
# retries=3: 3 fallos consecutivos = unhealthy
HEALTHCHECK --interval=10s --timeout=5s --start-period=60s --retries=3 \
    CMD curl -sf http://localhost:3001/api/health || exit 1

# Iniciar aplicacion
CMD ["node", "dist/main.js"]
