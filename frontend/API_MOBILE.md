# API Documentation - Media Downloader

Documentación para consumir el backend desde aplicaciones móviles.

## Base URL

```
http://localhost:3001
```

**Nota:** Cambia `localhost` por la IP de tu máquina cuando la app móvil esté en un dispositivo físico.

---

## Autenticación

### 1. Registro

**Endpoint:** `POST /api/auth/register`

**Body:**
```json
{
  "email": "usuario@example.com",
  "password": "tu_password_seguro",
  "name": "Nombre Usuario"
}
```

**Respuesta Exitosa (201):**
```json
{
  "message": "Usuario registrado exitosamente",
  "user": {
    "id": "uuid",
    "email": "usuario@example.com",
    "name": "Nombre Usuario"
  }
}
```

---

### 2. Login

**Endpoint:** `POST /api/auth/login`

**Body:**
```json
{
  "email": "usuario@example.com",
  "password": "tu_password_seguro"
}
```

**Respuesta Exitosa (200):**
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "uuid",
    "email": "usuario@example.com",
    "name": "Nombre Usuario"
  }
}
```

**Guardar el token:** Debes almacenar el `access_token` de forma segura en tu app móvil para usarlo en las peticiones protegidas.

---

### 3. Obtener Perfil (Protegido)

**Endpoint:** `GET /api/auth/me`

**Headers:**
```
Authorization: Bearer <access_token>
```

**Respuesta Exitosa (200):**
```json
{
  "id": "uuid",
  "email": "usuario@example.com",
  "name": "Nombre Usuario",
  "createdAt": "2024-01-01T00:00:00.000Z"
}
```

---

## Descargas

### 4. Crear Job de Descarga

**Endpoint:** `POST /api/downloads`

**Body:**
```json
{
  "url": "https://www.youtube.com/watch?v=example",
  "platform": "youtube"
}
```

**Plataformas soportadas:** `youtube`, `instagram`, `tiktok`, `twitter`, `facebook`

**Respuesta Exitosa (201):**
```json
[
  {
    "jobId": "uuid",
    "url": "https://www.youtube.com/watch?v=example",
    "platform": "youtube",
    "status": "pending",
    "progress": 0,
    "filename": null,
    "errorMessage": null,
    "createdAt": "2024-01-01T00:00:00.000Z"
  }
]
```

**Estados posibles:**
- `pending`: En cola
- `processing`: Procesando
- `completed`: Completado exitosamente
- `failed`: Falló

---

### 5. Listar Todos los Jobs

**Endpoint:** `GET /api/downloads`

**Query Params (opcional):**
- `status`: Filtrar por estado (`pending`, `processing`, `completed`, `failed`)

**Ejemplo:** `GET /api/downloads?status=completed`

**Respuesta Exitosa (200):**
```json
[
  {
    "jobId": "uuid",
    "url": "https://www.youtube.com/watch?v=example",
    "platform": "youtube",
    "status": "completed",
    "progress": 100,
    "filename": "video_123.mp4",
    "errorMessage": null,
    "createdAt": "2024-01-01T00:00:00.000Z"
  }
]
```

---

### 6. Obtener Estado de un Job Específico

**Endpoint:** `GET /api/downloads/:jobId`

**Ejemplo:** `GET /api/downloads/550e8400-e29b-41d4-a716-446655440000`

**Respuesta Exitosa (200):**
```json
{
  "jobId": "uuid",
  "url": "https://www.youtube.com/watch?v=example",
  "platform": "youtube",
  "status": "processing",
  "progress": 45,
  "filename": null,
  "errorMessage": null,
  "createdAt": "2024-01-01T00:00:00.000Z"
}
```

**Respuesta (404):** Si el job no existe

---

### 7. Descargar Archivo

**Endpoint:** `GET /api/downloads/download-file/:filename`

**Ejemplo:** `GET /api/downloads/download-file/video_123.mp4`

**Headers:**
```
Accept: application/octet-stream
```

**Respuesta:** Archivo binario (stream)

**Headers de respuesta:**
```
Content-Type: video/mp4
Content-Disposition: attachment; filename="video_123.mp4"
Content-Length: 12345678
```

**Tipos MIME soportados:**
- Video: `.mp4`, `.webm`, `.avi`, `.mov`, `.mkv`
- Audio: `.mp3`, `.m4a`, `.wav`, `.flac`

---

## Configuración CORS

El backend está configurado para aceptar peticiones desde:

- `http://localhost:3000`
- `http://127.0.0.1:3000`
- La URL definida en `FRONTEND_URL`

**Métodos permitidos:** `GET`, `POST`, `PUT`, `DELETE`, `OPTIONS`

**Headers permitidos:** `Content-Type`, `Authorization`, `X-Requested-With`

---

## Ejemplos de Implementación

### React Native (Axios)

```typescript
import axios from 'axios';

const API_BASE_URL = 'http://192.168.1.100:3001'; // IP de tu PC en la red

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor para agregar el token
api.interceptors.request.use((config) => {
  const token = await AsyncStorage.getItem('access_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Login
const login = async (email: string, password: string) => {
  const response = await api.post('/api/auth/login', { email, password });
  await AsyncStorage.setItem('access_token', response.data.access_token);
  return response.data;
};

// Crear descarga
const createDownload = async (url: string, platform: string) => {
  const response = await api.post('/api/downloads', { url, platform });
  return response.data;
};

// Descargar archivo
const downloadFile = async (filename: string, savePath: string) => {
  const { config, fs } = RNFetchBlob;
  const response = await config({
    fetchBody: () => api.get(`/api/downloads/download-file/${filename}`, {
      responseType: 'arraybuffer',
    }),
  }).fetch('GET', `${API_BASE_URL}/api/downloads/download-file/${filename}`);
  await response.fs.writeFile(savePath, response.data);
};
```

### Flutter (Dio)

```dart
import 'package:dio/dio.dart';

class ApiService {
  final Dio _dio = Dio();
  final String baseUrl = 'http://192.168.1.100:3001';

  ApiService() {
    _dio.options.baseUrl = baseUrl;
    _dio.options.headers = {'Content-Type': 'application/json'};

    // Interceptor para agregar el token
    _dio.interceptors.add(InterceptorsWrapper(
      onRequest: (options, handler) async {
        final token = await getToken(); // Tu método para obtener el token
        if (token != null) {
          options.headers['Authorization'] = 'Bearer $token';
        }
        handler.next(options);
      },
    ));
  }

  // Login
  Future<Map<String, dynamic>> login(String email, String password) async {
    final response = await _dio.post('/api/auth/login', data: {
      'email': email,
      'password': password,
    });
    return response.data;
  }

  // Crear descarga
  Future<List<dynamic>> createDownload(String url, String platform) async {
    final response = await _dio.post('/api/downloads', data: {
      'url': url,
      'platform': platform,
    });
    return List<dynamic>.from(response.data);
  }

  // Descargar archivo
  Future<void> downloadFile(String filename, String savePath) async {
    await _dio.download(
      '/api/downloads/download-file/$filename',
      savePath,
    );
  }
}
```

### Kotlin (Retrofit)

```kotlin
interface MediaDownloaderApi {
    @POST("/api/auth/login")
    suspend fun login(@Body request: LoginRequest): LoginResponse

    @POST("/api/downloads")
    suspend fun createDownload(@Body request: DownloadRequest): List<DownloadJob>

    @GET("/api/downloads")
    suspend fun getAllJobs(@Query("status") status: String?): List<DownloadJob>

    @GET("/api/downloads/{jobId}")
    suspend fun getJobStatus(@Path("jobId") jobId: String): DownloadJob

    @GET
    @Streaming
    suspend fun downloadFile(@Url url: String): ResponseBody
}

// Data classes
data class LoginRequest(val email: String, val password: String)
data class LoginResponse(val access_token: String, val user: User)
data class DownloadRequest(val url: String, val platform: String)
data class DownloadJob(
    val jobId: String,
    val url: String,
    val platform: String,
    val status: String,
    val progress: Int,
    val filename: String?,
    val errorMessage: String?,
    val createdAt: String
)

// Cliente Retrofit
val client = OkHttpClient.Builder()
    .addInterceptor { chain ->
        val token = getAuthToken() // Tu método para obtener el token
        val request = chain.request().newBuilder()
            .addHeader("Authorization", "Bearer $token")
            .build()
        chain.proceed(request)
    }
    .build()

val retrofit = Retrofit.Builder()
    .baseUrl("http://192.168.1.100:3001")
    .client(client)
    .addConverterFactory(MoshiConverterFactory.create())
    .build()

val api = retrofit.create(MediaDownloaderApi::class.java)
```

---

## Consideraciones Importantes

### 1. Conexión desde Dispositivo Móvil

Cuando la app móvil esté en un dispositivo físico, **no uses `localhost`**. Usa la **IP de tu PC en la red local**:

- Windows: `ipconfig` → buscar IPv4
- Mac/Linux: `ifconfig` o `ip a`

Ejemplo: `http://192.168.1.100:3001`

### 2. Almacenamiento de Tokens

- **iOS:** Usa Keychain
- **Android:** Usa EncryptedSharedPreferences
- **React Native:** Usa AsyncStorage (con precaución) o SecureStore

### 3. Manejo de Errores

Siempre maneja estos códigos de estado:

- `400`: Bad Request (validación de datos)
- `401`: Unauthorized (token inválido o expirado)
- `404`: Not Found (recurso no existe)
- `500`: Internal Server Error (error del servidor)

### 4. Polling para Estado de Descargas

Para monitorear el progreso de descargas, implementa polling:

```typescript
// Ejemplo en React Native
const pollJobStatus = async (jobId: string) => {
  const interval = setInterval(async () => {
    const job = await getJobStatus(jobId);

    if (job.status === 'completed') {
      clearInterval(interval);
      // Descargar el archivo
      downloadFile(job.filename);
    } else if (job.status === 'failed') {
      clearInterval(interval);
      // Mostrar error
      showError(job.errorMessage);
    } else {
      // Actualizar progreso
      updateProgress(job.progress);
    }
  }, 2000); // Cada 2 segundos
};
```

---

## Documentación Interactiva

Puedes acceder a la documentación interactiva de Swagger en tu navegador:

```
http://localhost:3001/api
```

---

## Variables de Entorno

El backend usa las siguientes variables de entorno:

```env
PORT=3001
FRONTEND_URL=http://localhost:3000
DATABASE_URL="file:./dev.db"
JWT_SECRET=tu_secreto_jwt_aqui
```

---

## Soporte

Para más información o problemas, consulta el repositorio del proyecto o contacta al equipo de desarrollo.
