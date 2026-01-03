import { contextBridge, ipcRenderer } from 'electron';

// Exponer API segura al proceso de renderizado
contextBridge.exposeInMainWorld('electronAPI', {
  // Obtener URL del backend
  getBackendURL: () => ipcRenderer.invoke('get-backend-url'),

  // Obtener ruta de descargas
  getDownloadsPath: () => ipcRenderer.invoke('get-downloads-path'),

  // Obtener versión de la app
  getAppVersion: () => ipcRenderer.invoke('get-app-version'),

  // Abrir carpeta de descargas
  openDownloadsFolder: () => ipcRenderer.invoke('open-downloads-folder'),

  // Detectar si estamos en modo desktop
  isDesktop: true,

  // Detectar plataforma
  platform: process.platform,
});

// Types para TypeScript
declare global {
  interface Window {
    electronAPI: {
      getBackendURL: () => Promise<string>;
      getDownloadsPath: () => Promise<string>;
      getAppVersion: () => Promise<string>;
      openDownloadsFolder: () => Promise<void>;
      isDesktop: boolean;
      platform: string;
    };
  }
}
