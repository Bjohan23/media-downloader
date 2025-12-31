# Media Downloader - Mobile App

Aplicación móvil multiplataforma para descargar contenido multimedia, construida con React Native y Expo.

## Tech Stack

- **Framework**: React Native + Expo SDK 50
- **Lenguaje**: TypeScript (strict mode)
- **Navegación**: React Navigation v6
- **Estado Global**: Zustand
- **HTTP Client**: Axios
- **Almacenamiento Seguro**: Expo SecureStore
- **Motor JS**: Hermes (habilitado por defecto)

## Arquitectura

El proyecto sigue **Clean Architecture** con tres capas bien definidas:

```
src/
├── domain/          # Dominio (entidades, casos de uso, interfaces)
│   ├── entities/    # Entidades del dominio
│   ├── repositories/ # Interfaces de repositorios
│   └── usecases/    # Casos de uso
├── data/            # Datos (implementación de repositorios, servicios)
│   ├── repositories/ # Implementaciones de repositorios
│   └── services/    # Servicios HTTP, SecureStore
└── presentation/    # Presentación (UI, navegación, estado)
    ├── screens/     # Pantallas
    ├── components/  # Componentes reutilizables
    ├── stores/      # Zustand stores
    ├── theme/       # Sistema de temas
    └── navigation/  # Configuración de navegación
```

## Características

- Arquitectura limpia y escalable
- TypeScript estricto
- Sistema de temas (Light/Dark)
- Componentes optimizados con React.memo
- Gestión de estado con Zustand
- Inyección de dependencias
- Manejo centralizado de errores
- UI profesional sin emojis

## Instalación

```bash
# Clonar el repositorio
cd mobile

# Instalar dependencias
npm install

# Iniciar el servidor de desarrollo
npm start
```

## Scripts Disponibles

```bash
npm start       # Iniciar servidor Expo
npm android     # Ejecutar en Android
npm ios         # Ejecutar en iOS
npm web         # Ejecutar en Web
npm lint        # Ejecutar ESLint
npm type-check  # Verificar tipos TypeScript
```

## Configuración de API

Edita `src/data/services/api.config.ts` para cambiar la URL base de la API:

```typescript
const API_CONFIG = {
  baseURL: __DEV__
    ? 'http://192.168.1.100:3001' // IP local para desarrollo
    : 'https://api.mediadownloader.com',
};
```

## Sistema de Temas

La app incluye dos temas predefinidos:

- **Ocean Breeze (Light)**: Tema claro con tonos azules
- **Dark Mode Native (Dark)**: Tema oscuro puro (negro iOS)

El tema se selecciona automáticamente según el sistema del dispositivo.

## Componentes Disponibles

- `Button`: Botón con iconos y loading states
- `Input`: Input de texto con iconos y validación
- `Card`: Contenedor con variantes (elevated, outlined, flat)
- `ProgressBar`: Barra de progreso
- `SelectPicker`: Selector modal

## Pantallas

### Home / Nueva Descarga
- Input para URL
- Selector de plataforma
- Selector de tipo (video/audio)
- Selector de calidad
- Selector de formato

### Cola de Descargas
- Lista optimizada de descargas
- Filtros por estado
- Barras de progreso en tiempo real
- Acciones (descargar, reintentar)

## Casos de Uso

```typescript
import { useCases } from './di';

// Crear descarga
const result = await useCases.downloads.create.execute(request);

// Obtener todas las descargas
const downloads = await useCases.downloads.getAll.execute();

// Monitorear job con polling
await useCases.downloads.monitor.execute(jobId, {
  onProgress: (job) => console.log('Progress:', job.progress),
  onComplete: (job) => console.log('Completed!'),
  onError: (job) => console.log('Error:', job.errorMessage),
});
```

## Estado Global

```typescript
// Auth Store
const { user, isAuthenticated, login, logout } = useAuthStore();

// Download Store
const { downloads, addDownload, updateDownload } = useDownloadStore();
```

## Performance Optimizations

- React.memo en todos los componentes
- useCallback/useMemo para callbacks y cálculos
- FlatList optimizada (keyExtractor, getItemLayout)
- Lazy loading de pantallas
- Hermes habilitado para mejor rendimiento JS

## Buenos Prácticas

1. **Sin colores hardcodeados**: Usar siempre `theme.colors.*`
2. **Sin strings mágicos**: Usar enums y constantes
3. **Componentes puros**: Evitar lógica de negocio en componentes
4. **Casos de uso**: Toda lógica de negocio va en `domain/usecases`
5. **Validación**: Validar en el dominio, no en la UI
6. **Manejo de errores**: Centralizado en servicios HTTP

## Estructura de Archivos

```
mobile/
├── App.tsx                 # Punto de entrada
├── package.json            # Dependencias
├── tsconfig.json           # Configuración TypeScript
├── app.json                # Configuración Expo
├── metro.config.js         # Configuración Metro bundler
└── src/
    ├── di.ts               # Contenedor de dependencias
    └── ... (ver estructura arriba)
```

## Desarrollo con Expo Go

1. Instala Expo Go en tu dispositivo móvil
2. Ejecuta `npm start`
3. Escanea el QR code desde Expo Go

## Build para Producción

```bash
# EAS Build (recomendado)
eas build --platform android
eas build --platform ios

# O build local
eas build --local --platform android
```

## Variables de Entorno

Crea un archivo `.env` en la raíz:

```env
API_BASE_URL=http://192.168.1.100:3001
```

## Troubleshooting

### Metro no detecta cambios
```bash
npm start -- --reset-cache
```

### Error de conexión en dispositivo físico
- Cambia `localhost` por tu IP local en `api.config.ts`
- Asegúrate de estar en la misma red WiFi

### TypeScript errors
```bash
npm run type-check
```

## Próximos Pasos

- [ ] Implementar autenticación completa
- [ ] Conectar con API real
- [ ] Agregar polling automático para descargas activas
- [ ] Implementar descarga de archivos
- [ ] Agregar notificaciones push
- [ ] Tests unitarios y E2E

## Licencia

MIT
