# Multi-stage build optimizado para NestJS Backend
# Autor: DevOps Senior
# Estrategia: Separar deps, build y runner para máximo cache

# ============================================
# Stage 1: Dependencies (cacheable)
# ============================================
FROM node:20-alpine AS deps

WORKDIR /app

# Copiar SOLAMENTE package files y prisma schema (maximiza cache)
COPY package*.json ./
COPY prisma ./prisma/

# Instalar dependencias de forma reproducible
RUN npm ci --ignore-scripts && \
    npm cache clean --force

# ============================================
# Stage 2: Builder
# ============================================
FROM node:20-alpine AS builder

WORKDIR /app

# Copiar node_modules desde stage deps (evita reinstalar)
COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/prisma ./prisma/
COPY package*.json ./

# Copiar código fuente (esta capa invalida cache si cambia código)
COPY . .

# Generar Prisma client
RUN npx prisma generate

# Compilar TypeScript a JavaScript
RUN npm run build

# ============================================
# Stage 3: Production Runner
# ============================================
FROM node:20-alpine AS production

WORKDIR /app

# Configurar entorno de producción
ENV NODE_ENV=production
ENV PORT=3001
ENV DOWNLOAD_PATH=/app/downloads

# Crear usuario no-root (security best practice)
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nestjs

# Instalar dependencias de producción solamente
COPY package*.json ./
COPY prisma ./prisma/
RUN npm ci --only=production --ignore-scripts && \
    npx prisma generate && \
    npm cache clean --force

# Copiar archivos compilados y Prisma client desde builder
COPY --from=builder --chown=nestjs:nodejs /app/dist ./dist
COPY --from=builder --chown=nestjs:nodejs /app/node_modules/.prisma ./node_modules/.prisma

# Crear directorio de descargas con permisos correctos
RUN mkdir -p /app/downloads && \
    chown -R nestjs:nodejs /app/downloads

# Cambiar a usuario no-root
USER nestjs

EXPOSE 3001

# Health check (para orchestradores como Coolify, Kubernetes, etc)
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
    CMD wget --no-verbose --tries=1 --spider http://localhost:3001/api || exit 1

# Iniciar aplicación
CMD ["node", "dist/main.js"]
