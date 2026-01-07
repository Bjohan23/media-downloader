# Guía de Despliegue en Coolify

Esta guía te ayudará a desplegar tu aplicación Media Downloader en Coolify.

## Requisitos Previos

1. **Servidor con Coolify instalado** - [Documentación oficial](https://coolify.io/docs)
2. **Repositorio Git** - Tu código debe estar en GitHub, GitLab o Bitbucket
3. **Docker** - Coolify usa Docker internamente

---

## Arquitectura del Despliegue

La aplicación consta de dos servicios separados:

1. **Backend (NestJS)** - API en el puerto 3001
2. **Frontend (Next.js 15)** - Web app en el puerto 3000

---

## Paso 1: Preparar el Repositorio

Asegúrate de que tu repositorio tenga:

```
your-repo/
├── backend/
│   ├── Dockerfile          ← Creado para producción
│   ├── .dockerignore       ← Creado
│   └── ...
├── frontend/
│   ├── Dockerfile          ← Creado para producción
│   ├── .dockerignore       ← Ya existe
│   └── ...
└── docker-compose.yml     ← Para desarrollo local
```

### Archivos Creados

✅ `backend/Dockerfile` - Imagen Docker multi-stage para NestJS
✅ `backend/.dockerignore` - Archivos a excluir del build
✅ `frontend/Dockerfile` - Imagen Docker multi-stage para Next.js
✅ `docker-compose.yml` - Para desarrollo local con Docker

---

## Paso 2: Desplegar el Backend en Coolify

### 2.1 Crear Nuevo Proyecto

1. En Coolify, ve a **Resources** → **New Resource**
2. Selecciona **Dockerfile**

### 2.2 Configurar el Proyecto Backend

**Basic Configuration:**
```
Name: media-downloader-backend
Repository: tu-usuario/media-downloader
Branch: main
Build Path: ./backend
Dockerfile Path: ./backend/Dockerfile
```

**Environment Variables:**
```env
NODE_ENV=production
PORT=3001
DATABASE_URL=file:/app/downloads/prod.db
DOWNLOAD_PATH=/app/downloads
JWT_SECRET=tu-secreto-super-seguro-aqui
FRONTEND_URL=https://tu-dominio.com
```

**Ports:**
```
Container Port: 3001
```

**Volumes (Persistencia):**
```
Type: Bind Mount
Mount Path: /app/downloads
Host Path: /var/lib/coolify/volumes/med-downloader-downloads
```

**Domain:**
```
Subdomain: api (ej: api.tu-dominio.com)
```

### 2.3 Deploy

Click en **Deploy** y espera a que termine.

---

## Paso 3: Desplegar el Frontend en Coolify

### 3.1 Crear Nuevo Proyecto

1. En Coolify, va a **Resources** → **New Resource**
2. Selecciona **Dockerfile**

### 3.2 Configurar el Proyecto Frontend

**Basic Configuration:**
```
Name: media-downloader-frontend
Repository: tu-usuario/media-downloader
Branch: main
Build Path: ./frontend
Dockerfile Path: ./frontend/Dockerfile
```

**Build Arguments:**
```
NEXT_PUBLIC_API_URL=https://api.tu-dominio.com
```

**Environment Variables:**
```env
NODE_ENV=production
PORT=3000
NEXT_PUBLIC_API_URL=https://api.tu-dominio.com
```

**Ports:**
```
Container Port: 3000
```

**Domain:**
```
Subdomain: (vacío para dominio principal)
Domain: tu-dominio.com
```

### 3.3 Health Check (Opcional pero Recomendado)

```
Path: /
Port: 3000
Interval: 30s
Timeout: 10s
Retries: 3
```

### 3.4 Deploy

Click en **Deploy** y espera a que termine.

---

## Paso 4: Verificar el Despliegue

### 4.1 Backend

1. Ve a `https://api.tu-dominio.com/api`
2. Deberías ver la documentación de Swagger UI
3. Verifica que los endpoints respondan correctamente

### 4.2 Frontend

1. Ve a `https://tu-dominio.com`
2. La app debería cargar correctamente
3. Intenta crear una descarga de prueba
4. Verifica que conecte con el backend

---

## Paso 5: Configurar HTTPS (Automático en Coolify)

Coolify automáticamente configura HTTPS usando Let's Encrypt:

- ✅ Certificados SSL automáticos
- ✅ Renovación automática
- ✅ Redirección HTTP → HTTPS

No necesitas hacer nada manualmente.

---

## Configuración Avanzada

### Base de Datos Externa (Opcional)

Si prefieres usar PostgreSQL en lugar de SQLite:

1. **Crear Base de Datos en Coolify:**
   - Resources → New Resource → PostgreSQL
   - Configurar nombre y credenciales

2. **Actualizar Variables de Entorno del Backend:**
   ```env
   DATABASE_URL=postgresql://user:password@host:port/database
   ```

### Redis para Colas (Opcional)

Si quieres usar colas reales con Bull:

1. **Crear Redis en Coolify:**
   - Resources → New Resource → Redis

2. **Actualizar Variables de Entorno del Backend:**
   ```env
   REDIS_HOST=redis-host
   REDIS_PORT=6379
   ```

### Almacenamiento S3 para Descargas (Opcional)

Para almacenar los archivos descargados en S3 en lugar de local:

1. **Instalar AWS SDK en el backend:**
   ```bash
   cd backend
   npm install @aws-sdk/client-s3
   ```

2. **Configurar variables de entorno:**
   ```env
   S3_BUCKET=nombre-del-bucket
   S3_REGION=us-east-1
   AWS_ACCESS_KEY_ID=tu-access-key
   AWS_SECRET_ACCESS_KEY=tu-secret-key
   ```

---

## Solución de Problemas

### Error: "Cannot connect to backend"

**Problema:** El frontend no puede conectar con el backend.

**Solución:**
1. Verifica que `NEXT_PUBLIC_API_URL` sea correcta
2. Asegúrate de que el backend esté corriendo
3. Verifica los logs del backend en Coolify
4. Confirma que CORS permita tu dominio del frontend

### Error: "Port already in use"

**Problema:** Puerto 3001 o 3000 ya está en uso.

**Solución:**
- Cambia los puertos en la configuración de Coolify
- Asegúrate de que no haya otros contenedores usando esos puertos

### Error: "Database is locked"

**Problema:** SQLite en producción con múltiples contenedores.

**Solución:**
- Usa PostgreSQL en su lugar (ver sección de Base de Datos Externa)
- O asegúrate de solo tener un contenedor del backend corriendo

### Build falla

**Problema:** El Docker build falla.

**Solución:**
1. Verifica que los Dockerfiles estén en el lugar correcto
2. Revisa los logs de build en Coolify
3. Asegúrate de que `next.config.ts` tenga `output: 'standalone'`
4. Verifica que todas las dependencias estén en `package.json`

---

## Monitoreo y Logs

### Ver Logs en Coolify

1. Ve al recurso (backend o frontend)
2. Click en **Logs**
3. Puedes ver logs en tiempo real
4. También puedes descargar logs históricos

### Métricas de Recursos

Coolify muestra automáticamente:
- CPU usage
- Memory usage
- Disk usage
- Network traffic

---

## Actualizaciones Futuras

### Para Actualizar la Aplicación

1. **Hacer cambios** en el código
2. **Push al repositorio** (GitHub/GitLab/Bitbucket)
3. En Coolify, click en **Deploy** → **Deploy latest commit**
4. Coolify hará:
   - Pull de los últimos cambios
   - Build de nueva imagen Docker
   - Deploy sin downtime (zero-downtime deployment)

### Rollback

Si algo sale mal:
1. Ve a **Deployments**
2. Encuentra el commit funcional anterior
3. Click en **Redeploy**

---

## Seguridad

### Variables de Entorno Sensibles

Nunca commitear:
- `JWT_SECRET`
- Database passwords
- API keys

Usa los **Secrets** de Coolify para almacenarlas de forma segura.

### Firewalls

Asegúrate de que tu servidor tenga:
- Puerto 80 abierto (HTTP)
- Puerto 443 abierto (HTTPS)
- Puertos 3000 y 3001 abiertos solo internamente (Docker network)

### Rate Limiting

Considera agregar rate limiting en el backend para prevenir abusos:

```typescript
// En el main.ts del backend
import rateLimit from 'express-rate-limit';

app.use(rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 100 // límite por IP
}));
```

---

## Costos Estimados

### Servidor Requerido

- **Mínimo:** 2 CPU, 2GB RAM (para desarrollo/pruebas)
- **Recomendado:** 2-4 CPU, 4-8GB RAM (producción)
- **Alto tráfico:** 4+ CPU, 16GB+ RAM

### Proveedores de VPS

- **Hetzner** - ~€5-10/mes (muy económico)
- **DigitalOcean** - ~$24-48/mes
- **AWS/Lightsail** - ~$20-50/mes
- **Vultr** - ~$12-24/mes

---

## Backup

### Backup Automático de Descargas

Coolify no hace backup automático de volúmenes. Configura:

```bash
# Cron job en el servidor
0 2 * * * tar -czf /backup/med-downloader-$(date +\%Y\%m\%d).tar.gz /var/lib/coolify/volumes/med-downloader-downloads
```

### Backup de Base de Datos

```bash
# Si usas SQLite
0 3 * * * cp /var/lib/coolify/volumes/backend-downloads/prod.db /backup/prod-$(date +\%Y\%m\%d).db
```

---

## Checklist Pre-Producción

Antes de ir a producción:

- [ ] Cambiar `JWT_SECRET` a un valor seguro
- [ ] Configurar dominios personalizados
- [ ] Verificar HTTPS funciona
- [ ] Configurar backups automáticos
- [ ] Probar el flujo completo de descarga
- [ ] Verificar WebSocket funciona
- [ ] Configurar monitoreo
- [ ] Ajustar recursos del servidor (CPU/RAM)
- [ ] Configurar rate limiting
- [ ] Revisar logs regularmente

---

## Soporte

- **Documentación de Coolify:** https://coolify.io/docs
- **Discord de Coolify:** https://coolify.io/discord
- **Issues del proyecto:** GitHub Issues

---

## Notas Finales

✅ Los Dockerfiles creados están optimizados para producción
✅ Usan multi-stage builds para reducir el tamaño final
✅ Incluyen health checks
✅ Soportan zero-downtime deployments
✅ Son compatibles con Coolify

¡Buena suerte con tu despliegue! 🚀
