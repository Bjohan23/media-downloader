/**
 * Configuración de la API
 *
 * IMPORTANTE: Para conectar desde un dispositivo móvil físico:
 * 1. Abre una terminal en tu backend y ejecuta: ipconfig (Windows) o ifconfig (Mac/Linux)
 * 2. Busca tu IPv4 (ejemplo: 192.168.1.15)
 * 3. Cambia la IP de abajo por tu IP real
 * 4. Asegúrate de que tu dispositivo móvil esté en la misma red WiFi
 *
 * Para emuladores iOS/Android, puedes usar localhost
 */

const getBaseURL = () => {
  if (__DEV__) {
    // Para desarrollo: usar localhost o tu IP de red local
    // Si usas emulador, localhost funciona
    // Si usas dispositivo físico, usa tu IP de red (ej: 192.168.1.X)

    // Opción 1: Localhost (para emuladores)
    // return 'http://localhost:3001';

    // Opción 2: IP de red (para dispositivos físicos)
    // CAMBIAR ESTO POR TU IP REAL:
    return 'http://192.168.0.104:3001';

    // Para encontrar tu IP:
    // - Windows: abre cmd y ejecuta "ipconfig"
    // - Mac/Linux: abre terminal y ejecuta "ifconfig" o "ip a"
  }

  // Producción
  return 'https://api.mediadownloader.com';
};

const API_CONFIG = {
  // Base URL detectada automáticamente
  baseURL: getBaseURL(),

  // Timeout en ms
  timeout: 30000,

  // Endpoints
  endpoints: {
    auth: {
      login: '/api/auth/login',
      register: '/api/auth/register',
      me: '/api/auth/me',
      logout: '/api/auth/logout',
    },
    downloads: {
      create: '/api/downloads',
      getAll: '/api/downloads',
      getById: '/api/downloads/:jobId',
      downloadFile: '/api/downloads/download-file/:filename',
    },
  },
};

// Log en desarrollo para verificar la URL
if (__DEV__) {
  console.log('═══════════════════════════════════════');
  console.log('🔧 API CONFIGURACIÓN');
  console.log('═══════════════════════════════════════');
  console.log(`Base URL: ${API_CONFIG.baseURL}`);
  console.log('');
  console.log('⚠️  Si no puedes conectar:');
  console.log('   1. Verifica que el backend esté corriendo');
  console.log('   2. Encuentra tu IP con: ipconfig (Windows) o ifconfig (Mac)');
  console.log('   3. Actualiza la IP en api.config.ts');
  console.log('   4. Asegúrate de que móvil y PC estén en la misma red WiFi');
  console.log('═══════════════════════════════════════');
}

export default API_CONFIG;
