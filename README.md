# Media Downloader - Aplicación Web Moderna

Una aplicación web moderna y escalable para descargar contenido multimedia desde múltiples plataformas como YouTube, TikTok, Instagram, Facebook y más.

## 🚀 Características

### Core Features
- ✅ Descargas desde múltiples plataformas (YouTube, TikTok, Instagram, Facebook, etc.)
- ✅ Soporte para video y audio por separado
- ✅ Múltiples calidades disponibles (144p, 360p, 720p, 1080p, 4K)
- ✅ Diversos formatos de salida (MP4, WEBM, MP3, M4A, AVI, MOV)
- ✅ Vista previa del contenido (título, duración, miniatura)
- ✅ Procesamiento en segundo plano con colas
- ✅ Descargas simultáneas controladas
- ✅ Progreso en tiempo real con WebSockets
- ✅ Interfaz responsive y moderna
- ✅ **Interfaz completamente en español**
- ✅ **Modo oscuro/claro funcional**

### Features Adicionales
- ✅ Modo oscuro/claro con toggle animado
- ✅ Autenticación de usuarios
- ✅ Historial de descargas
- ✅ Base de datos persistente
- ✅ Manejo robusto de errores
- ✅ **Sin errores de hidratación SSR**

## 🏗️ Arquitectura Técnica

### Frontend (Next.js 15)
- **Framework**: Next.js 15 con App Router
- **Lenguaje**: TypeScript 5
- **Estilos**: Tailwind CSS 4 + shadcn/ui
- **Estado**: Zustand + TanStack Query
- **Temas**: next-themes (modo oscuro/claro)
- **Real-time**: Socket.IO Client
- **Internacionalización**: Español nativo

### Backend (NestJS)
- **Framework**: NestJS con TypeScript
- **Colas**: BullMQ + Redis
- **Base de datos**: Prisma + SQLite
- **WebSockets**: Socket.IO
- **Motor de descarga**: node-ytdl-core + FFmpeg
- **Autenticación**: JWT + bcrypt

### Flujo de Descarga

1. **Usuario pega URLs** → Frontend valida y envía a API
2. **API crea jobs** → Se agregan a la cola de Redis
3. **Workers procesan** → Descargan en segundo plano
4. **Progreso real-time** → WebSockets informan al frontend
5. **Archivo listo** → Usuario puede descargar el resultado

## 📋 Requisitos

### Prerrequisitos
- Node.js 18+
- Redis server
- FFmpeg instalado en el sistema

### Instalación

1. **Clonar el repositorio**
```bash
git clone <repository-url>
cd media-downloader
```

2. **Instalar dependencias del frontend**
```bash
bun install
```

3. **Instalar dependencias del backend**
```bash
cd backend
bun install
cd ..
```

4. **Configurar base de datos**
```bash
bun run db:push
bun run db:generate
```

5. **Iniciar Redis** (si no está corriendo)
```bash
redis-server
```

## 🚀 Ejecución

### Desarrollo Rápido

```bash
# Usar script automático
./start-dev.sh
```

### Manual

1. **Iniciar backend**
```bash
cd backend
bun run start:dev
```

2. **Iniciar frontend** (en otra terminal)
```bash
bun run dev
```

### Producción

```bash
# Construir para producción
./build-prod.sh

# Iniciar servicios
cd backend && bun run start:prod
bun run start
```

## 🔧 Configuración

### Variables de Entorno (Backend)
Crear `backend/.env`:
```env
DATABASE_URL="file:./dev.db"
REDIS_HOST=localhost
REDIS_PORT=6379
JWT_SECRET=your-super-secret-jwt-key
FRONTEND_URL=http://localhost:3000
PORT=3001
MAX_CONCURRENT_DOWNLOADS=3
DOWNLOAD_PATH=./downloads
```

### Variables de Entorno (Frontend)
Actualizar `.env`:
```env
DATABASE_URL=file:/home/z/my-project/db/custom.db
NEXT_PUBLIC_API_URL=http://localhost:3001
NEXT_PUBLIC_WS_URL=http://localhost:3001
```

## 📁 Estructura del Proyecto

```
media-downloader/
├── src/                          # Frontend Next.js
│   ├── app/                      # App Router
│   │   ├── layout.tsx           # Layout con ThemeProvider
│   │   └── page.tsx             # Página principal en español
│   ├── components/               # Componentes UI
│   │   ├── ui/                   # shadcn/ui components
│   │   └── theme-provider.tsx   # ThemeProvider wrapper
│   ├── lib/                      # Utilidades y configuración
│   ├── types/                    # Tipos TypeScript
│   └── ...
├── backend/                      # Backend NestJS
│   ├── src/
│   │   ├── modules/              # Módulos de negocio
│   │   │   ├── download/         # Gestión de descargas
│   │   │   ├── queue/            # Procesamiento de colas
│   │   │   ├── websocket/        # Comunicación real-time
│   │   │   └── auth/             # Autenticación
│   │   ├── common/               # Servicios comunes
│   │   └── ...
│   └── package.json
├── downloads/                    # Archivos descargados
├── prisma/                       # Schema de base de datos
├── start-dev.sh                  # Script desarrollo automático
├── build-prod.sh                 # Script producción
└── README.md                     # Documentación completa
```

## 🎯 Uso

### 1. Agregar URLs
- Pegue una o múltiples URLs (una por línea)
- Seleccione tipo de media (video/audio)
- Elija calidad y formato deseados
- Presione "Iniciar Descarga"

### 2. Monitorear Progreso
- Ver progreso en tiempo real
- Estados: En cola → Descargando → Completado/Error
- Barra de progreso visual
- Notificaciones de estado en español

### 3. Descargar Archivos
- Una vez completado, presione "Descargar"
- Los archivos se guardan en `/downloads`
- Disponibles para descarga directa

### 4. Modo Oscuro/Claro
- Toggle en la esquina superior derecha
- Iconos animados (Sol/Luna)
- Persistencia de preferencia
- Sin errores de hidratación

## 🔧 API Endpoints

### Descargas
- `POST /api/downloads` - Crear nuevos jobs
- `GET /api/downloads` - Listar todos los jobs
- `GET /api/downloads/:id` - Obtener job específico

### Autenticación
- `POST /api/auth/register` - Registrar usuario
- `POST /api/auth/login` - Iniciar sesión
- `GET /api/auth/me` - Obtener perfil

### WebSockets
- `subscribe-jobs` - Suscribirse a actualizaciones
- `job-update` - Recibir actualizaciones de jobs
- `notification` - Recibir notificaciones

## 🚀 Escalabilidad

### Horizontal Scaling
- **Multiple Workers**: Escalar workers de descarga
- **Redis Cluster**: Para colas distribuidas
- **Load Balancer**: Nginx o similar
- **Database**: PostgreSQL para producción

### Optimizaciones
- **Cache**: Redis para información frecuente
- **CDN**: Para archivos descargados
- **Compression**: Gzip para respuestas API
- **Rate Limiting**: Prevenir abusos

## 🔒 Seguridad

### Implementado
- JWT para autenticación
- bcrypt para passwords
- CORS configurado
- Validación de inputs
- Sanitización de URLs

### Recomendaciones
- HTTPS en producción
- Rate limiting por usuario
- Monitoreo de actividades
- Backup de base de datos

## 🐛 Troubleshooting

### Problemas Comunes

1. **Redis no conecta**
```bash
# Verificar Redis
redis-cli ping
# Debería responder PONG
```

2. **FFmpeg no encontrado**
```bash
# Instalar FFmpeg
# Ubuntu/Debian
sudo apt install ffmpeg

# macOS
brew install ffmpeg

# Windows
# Descargar desde ffmpeg.org
```

3. **Descargas fallan**
- Verificar URL válida
- Confirmar plataforma soportada
- Revisar logs del backend

4. **Errores de hidratación**
- ✅ **Solucionado**: ThemeProvider configurado correctamente
- ✅ **Solucionado**: `suppressHydrationWarning` en el body
- ✅ **Solucionado**: `mounted` state para client-side only

## 🌟 Mejoras Recientes

### v2.0 - Versión Actual
- ✅ **Interfaz en español completa**
- ✅ **Modo oscuro/claro funcional**
- ✅ **Sin errores de hidratación SSR**
- ✅ **Iconos mejorados para tema toggle**
- ✅ **Textos localizados (calidad, estado, etc.)**
- ✅ **Experiencia de usuario optimizada**

## 📄 Licencia

MIT License - Ver archivo LICENSE para detalles.

## 🤝 Contribuciones

1. Fork del proyecto
2. Crear feature branch
3. Commit de cambios
4. Push a branch
5. Crear Pull Request

## 📞 Soporte

Para soporte o preguntas:
- Crear issue en GitHub
- Contactar al maintainers
- Revisar documentación

---

**Built with ❤️ using Next.js, NestJS, and modern web technologies**

**Versión en español con tema oscuro/claro y sin errores de SSR** 🇪🇸