/**
 * Utilidades para detectar y trabajar con la versión desktop de la aplicación
 */

// Types para la API de Electron
export interface ElectronAPI {
  getBackendURL: () => Promise<string>;
  getDownloadsPath: () => Promise<string>;
  getAppVersion: () => Promise<string>;
  openDownloadsFolder: () => Promise<void>;
  isDesktop: boolean;
  platform: string;
}

declare global {
  interface Window {
    electronAPI?: ElectronAPI;
  }
}

/**
 * Detecta si la aplicación está corriendo en modo desktop (Electron)
 */
export const isDesktop = (): boolean => {
  if (typeof window === 'undefined') return false;
  return window.electronAPI?.isDesktop === true;
};

/**
 * Obtiene la URL del backend
 * - En modo desktop: usa la URL del backend embebido
 * - En modo web: usa la variable de entorno NEXT_PUBLIC_API_URL
 */
export const getBackendURL = async (): Promise<string> => {
  if (isDesktop() && window.electronAPI) {
    return await window.electronAPI.getBackendURL();
  }

  // Fallback para desarrollo web
  return process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
};

/**
 * Obtiene la URL del backend de forma síncrona (para casos donde no se puede usar async)
 */
export const getBackendURLSync = (): string => {
  if (isDesktop()) {
    // En desktop, el backend siempre corre en localhost
    // El puerto exacto se obtiene de forma asíncrona cuando es necesario
    return 'http://localhost:3001';
  }

  return process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
};

/**
 * Obtiene la ruta de la carpeta de descargas
 * Solo funciona en modo desktop
 */
export const getDownloadsPath = async (): Promise<string | null> => {
  if (isDesktop() && window.electronAPI) {
    return await window.electronAPI.getDownloadsPath();
  }
  return null;
};

/**
 * Abre la carpeta de descargas en el explorador de archivos
 * Solo funciona en modo desktop
 */
export const openDownloadsFolder = async (): Promise<void> => {
  if (isDesktop() && window.electronAPI) {
    await window.electronAPI.openDownloadsFolder();
  }
};

/**
 * Obtiene la versión de la aplicación
 * Solo funciona en modo desktop
 */
export const getAppVersion = async (): Promise<string | null> => {
  if (isDesktop() && window.electronAPI) {
    return await window.electronAPI.getAppVersion();
  }
  return null;
};

/**
 * Obtiene la plataforma (windows, darwin, linux)
 */
export const getPlatform = (): string => {
  if (isDesktop() && window.electronAPI) {
    return window.electronAPI.platform;
  }

  // Fallback para web
  if (typeof window !== 'undefined') {
    const userAgent = window.navigator.userAgent;
    if (userAgent.includes('Win')) return 'windows';
    if (userAgent.includes('Mac')) return 'darwin';
    if (userAgent.includes('Linux')) return 'linux';
  }

  return 'unknown';
};

/**
 * Hook de React para usar la API de Electron
 */
export const useElectronAPI = () => {
  return {
    isDesktop: isDesktop(),
    getBackendURL: getBackendURL,
    getDownloadsPath: getDownloadsPath,
    openDownloadsFolder: openDownloadsFolder,
    getAppVersion: getAppVersion,
    platform: getPlatform(),
  };
};

/**
 * Configuración de Axios para usar automáticamente la URL correcta del backend
 */
export const getAxiosConfig = async () => {
  const baseURL = await getBackendURL();

  return {
    baseURL,
    headers: {
      'Content-Type': 'application/json',
    },
  };
};
