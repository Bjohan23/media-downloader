# Configuración de Variables de Entorno

## Desarrollo

Para desarrollo local, copia el archivo `.env.example` a `.env.local`:

```bash
cp .env.example .env.local
```

La configuración por defecto es:
```
NEXT_PUBLIC_API_URL=http://localhost:3001
```

## Producción

Al desplegar en un servidor, necesitas configurar la variable de entorno `NEXT_PUBLIC_API_URL` con la URL de tu backend.

### Ejemplos de configuración:

#### Vercel / Netlify
En la configuración del proyecto, agrega:
```
NEXT_PUBLIC_API_URL=https://tu-backend-api.com
```

#### Docker / VPS
Crea el archivo `.env.local` o exporta la variable:
```bash
export NEXT_PUBLIC_API_URL=https://tu-backend-api.com
```

#### Docker Compose
```yaml
services:
  frontend:
    environment:
      - NEXT_PUBLIC_API_URL=https://tu-backend-api.com
```

### Notas Importantes:

1. **El prefijo `NEXT_PUBLIC_` es obligatorio** para que las variables estén disponibles en el lado del cliente.

2. **Nunca commits archivos `.env.local`** - ya están incluidos en el `.gitignore`.

3. **En producción**, reemplaza `http://localhost:3001` con tu URL real del backend.

4. Si tu frontend y backend están en el mismo dominio (usando reverse proxy como Nginx o Caddy), puedes usar:
   ```
   NEXT_PUBLIC_API_URL=/api
   ```
   Y configurar el proxy para redirigir `/api` al backend.
