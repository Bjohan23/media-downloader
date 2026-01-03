# Media Downloader - Desktop Application

Versión desktop standalone de Media Downloader construida con Electron y NestJS embebido.

## Características

- ✅ **100% Standalone** - No requiere backend en la nube
- ✅ **Una sola aplicación** - Todo empaquetado en un .exe/.dmg/.AppImage
- ✅ **Backend embebido** - NestJS corre localmente dentro de la app
- ✅ **Base de datos local** - SQLite incluida
- ✅ **yt-dlp integrado** - Binary incluido para todas las plataformas
- ✅ **Interfaz moderna** - Next.js + shadcn/ui

## Requisitos de Desarrollo

Para desarrollar la aplicación desktop necesitas:

- **Node.js** 18+ y npm
- **Python** 3.8+ (para node-gyp)
- **Visual Studio Build Tools** (Windows) o **Xcode** (macOS)
- **Git**

## Instalación

```bash
cd desktop
npm install
```

## Modo Desarrollo

### Opción 1: Full Stack Development

Inicia todo simultáneamente (backend, frontend, electron):

```bash
npm run dev
```

Esto iniciará:
1. Backend NestJS en http://localhost:3001
2. Frontend Next.js en http://localhost:3000
3. Electron cargando el frontend

### Opción 2: Desarrollo Individual

```bash
# Terminal 1: Backend
npm run dev:backend

# Terminal 2: Frontend
npm run dev:frontend

# Terminal 3: Electron (después de que el frontend esté listo)
npm run dev:electron
```

## Construcción para Producción

### Paso 1: Compilar Frontend y Backend

```bash
npm run build
```

Esto compilará:
- Frontend Next.js a `.next/`
- Backend NestJS a `backend/dist/`
- TypeScript de Electron a `dist/`

### Paso 2: Empaquetar para tu Plataforma

#### Windows (.exe)
```bash
npm run dist:windows
```

Generará: `release/Media Downloader Setup 1.0.0.exe`

#### macOS (.dmg)
```bash
npm run dist:mac
```

Generará: `release/Media Downloader-1.0.0.dmg`

#### Linux (.AppImage, .deb)
```bash
npm run dist:linux
```

Generará: `release/Media Downloader-1.0.0.AppImage`

#### Todas las plataformas
```bash
npm run dist
```

## Empaquetado de yt-dlp

La aplicación necesita yt-dlp como bundled binary. Sigue estos pasos:

### 1. Descargar yt-dlp

**Windows:**
```bash
# Descargar desde GitHub
curl -L https://github.com/yt-dlp/yt-dlp/releases/latest/download/yt-dlp.exe -o desktop/binaries/windows/yt-dlp.exe

# O usando PowerShell
Invoke-WebRequest -Uri "https://github.com/yt-dlp/yt-dlp/releases/latest/download/yt-dlp.exe" -OutFile "desktop/binaries/windows/yt-dlp.exe"
```

**macOS:**
```bash
curl -L https://github.com/yt-dlp/yt-dlp/releases/latest/download/yt-dlp -o desktop/binaries/macos/yt-dlp
chmod +x desktop/binaries/macos/yt-dlp
```

**Linux:**
```bash
curl -L https://github.com/yt-dlp/yt-dlp/releases/latest/download/yt-dlp -o desktop/binaries/linux/yt-dlp
chmod +x desktop/binaries/linux/yt-dlp
```

### 2. Verificar Binarios

```bash
# Verificar que están descargados
ls -la desktop/binaries/windows/
ls -la desktop/binaries/macos/
ls -la desktop/binaries/linux/
```

## Estructura del Proyecto

```
desktop/
├── src/
│   ├── main.ts           # Proceso principal de Electron
│   └── preload.ts        # Preload script para seguridad
├── binaries/             # yt-dlp bundled binaries
│   ├── windows/
│   ├── macos/
│   └── linux/
├── resources/            # Recursos estáticos
│   ├── error.html        # Página de error
│   ├── icon.ico          # Icono Windows
│   ├── icon.icns         # Icono macOS
│   └── icon.png          # Icono Linux
├── dist/                 # TypeScript compilado
├── release/              # Instaladores generados
├── package.json
├── tsconfig.json
└── README.md
```

## Configuración del Frontend para Desktop

El frontend necesita saber que está corriendo en modo desktop. Agrega esto a tu frontend:

### 1. Crear servicio de detección de desktop

**frontend/src/lib/desktop.ts**
```typescript
export const isDesktop = () => {
  return typeof window !== 'undefined' && window.electronAPI?.isDesktop === true;
};

export const getBackendURL = async () => {
  if (isDesktop()) {
    return await window.electronAPI.getBackendURL();
  }
  return process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
};
```

### 2. Usar en tus llamadas API

```typescript
import { getBackendURL } from '@/lib/desktop';

const api = axios.create({
  baseURL: await getBackendURL(),
});
```

## Variables de Entorno

El backend se configura automáticamente con:

```env
PORT=3001  # Puerto dinámico si está ocupado
DATABASE_URL=file:{userData}/downloads/desktop.db
DOWNLOAD_PATH={userData}/downloads
YT_DLP_PATH={binaries}/{platform}/yt-dlp
```

## Iconos de la Aplicación

Necesitas agregar iconos en `desktop/resources/`:

- **Windows**: `icon.ico` (256x256 mínimo)
- **macOS**: `icon.icns` (1024x1024 mínimo)
- **Linux**: `icon.png` (512x512 mínimo)

### Generar iconos

Usa herramientas como:
- **Windows**: [ICO Convert](https://icoconvert.com/)
- **macOS**: `iconutil` (incluido en macOS)
- **Online**: [favicon.io](https://favicon.io/)

## Solución de Problemas

### Error: "Backend main.js not found"

**Solución:**
```bash
cd backend
npm run build
```

### Error: "yt-dlp not found"

**Solución:**
```bash
# Descargar yt-dlp para tu plataforma (ver sección "Empaquetado de yt-dlp")
```

### Error: "Module not found" en producción

**Solución:**
Asegúrate de que `backend/node_modules` esté incluido en `package.json` bajo `extraResources`.

### La app se abre pero muestra pantalla blanca

**Solución:**
1. Abre DevTools (Ctrl+Shift+I o Cmd+Option+I)
2. Revisa la consola para errores
3. Verifica que el backend haya iniciado correctamente

### El puerto 3001 ya está en uso

**Solución:**
La app automáticamente buscará otro puerto disponible (3002, 3003, etc.).

## Distribución

### Crear instalador con actualizaciones automáticas

Para agregar actualizaciones automáticas, instala `electron-updater`:

```bash
npm install electron-updater
```

Agrega a `src/main.ts`:
```typescript
import { autoUpdater } from 'electron-updater';

app.whenReady().then(() => {
  autoUpdater.checkForUpdatesAndNotify();
});
```

### Code Signing (Windows & macOS)

**Windows:**
```bash
# Instalar Windows SDK
# Configurar en .env
CSC_LINK=path/to/cert.pfx
CSC_KEY_PASSWORD=your_password
```

**macOS:**
```bash
# Usar certificado de developer
export CSC_LINK=path/to/cert.p12
export CSC_KEY_PASSWORD=your_password
npm run dist:mac
```

## Tamaño del Instalador

El tamaño final dependerá de:
- **Electron**: ~100-150MB
- **Node modules**: ~50-100MB
- **Frontend compilado**: ~20-30MB
- **Total estimado**: **200-300MB**

## Rendimiento

### Optimizaciones aplicadas:

1. ✅ Backend compilado a JavaScript
2. ✅ Frontend Next.js con static generation
3. ✅ Tree-shaking de dependencias
4. ✅ node_modules innecesarios excluidos
5. ✅ Assets comprimidos

### Tiempos de inicio:

- **Cold start**: 3-5 segundos
- **Backend listo**: 5-8 segundos
- **Interfaz cargada**: 8-12 segundos

## Licencia

MIT - Ver archivo principal LICENSE

## Soporte

Para issues o preguntas, crea un issue en el repositorio principal.
