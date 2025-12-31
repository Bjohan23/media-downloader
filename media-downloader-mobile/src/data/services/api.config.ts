/**
 * Configuración de la API
 */
const API_CONFIG = {
  // Base URL - cambiar según entorno
  baseURL:
    __DEV__
      ? 'http://192.168.1.100:3001' // IP local para desarrollo
      : 'https://api.mediadownloader.com', // Producción

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

export default API_CONFIG;
