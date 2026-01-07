import { app, BrowserWindow, ipcMain } from 'electron';
import * as path from 'path';
import * as fs from 'fs';
import { spawn, ChildProcess } from 'child_process';
import * as portfinder from 'portfinder';
import treeKill = require('tree-kill');

let mainWindow: BrowserWindow | null = null;
let backendProcess: ChildProcess | null = null;
let frontendProcess: ChildProcess | null = null;
let backendPort = 3001;
let frontendPort = 3000;
const isDev = process.env.NODE_ENV === 'development' || !app.isPackaged;

// Determinar rutas según si está empaquetado o en desarrollo
function getAppPaths() {
  if (isDev) {
    return {
      backendPath: path.join(__dirname, '../../backend'),
      frontendPath: path.join(__dirname, '../../frontend'),
      backendDist: path.join(__dirname, '../../backend/dist'),
      frontendDist: path.join(__dirname, '../../frontend/.next'),
      downloadsPath: path.join(__dirname, '../../backend/downloads'),
      ytDlpPath: getBinaryPath(),
    };
  } else {
    // En producción, las rutas son diferentes
    const appPath = app.getAppPath();
    const userDataPath = app.getPath('userData');

    return {
      backendPath: path.join(appPath, 'backend'),
      frontendPath: path.join(appPath, 'frontend'),
      backendDist: path.join(appPath, 'backend', 'dist'),
      frontendDist: path.join(appPath, 'frontend', '.next'),
      downloadsPath: path.join(userDataPath, 'downloads'),
      ytDlpPath: getBinaryPath(),
    };
  }
}

function getBinaryPath(): string {
  const platform = process.platform;
  const arch = process.arch;

  if (isDev) {
    // En desarrollo, usar yt-dlp del sistema
    return 'yt-dlp';
  }

  // En producción, usar el binary incluido
  const binariesPath = path.join(process.resourcesPath, 'binaries');

  if (platform === 'win32') {
    return path.join(binariesPath, 'windows', 'yt-dlp.exe');
  } else if (platform === 'darwin') {
    return path.join(binariesPath, 'macos', 'yt-dlp');
  } else if (platform === 'linux') {
    return path.join(binariesPath, 'linux', 'yt-dlp');
  }

  return 'yt-dlp';
}

// Asegurar que el directorio de descargas existe
function ensureDownloadsDir() {
  const paths = getAppPaths();
  if (!fs.existsSync(paths.downloadsPath)) {
    fs.mkdirSync(paths.downloadsPath, { recursive: true });
  }
}

// Iniciar el servidor standalone de Next.js
function startFrontend(): Promise<number> {
  return new Promise((resolve, reject) => {
    const paths = getAppPaths();

    console.log('Starting frontend server...');

    // Buscar un puerto disponible
    portfinder.getPort({ port: 3000, stopPort: 3010 }, (err, port) => {
      if (err) {
        reject(err);
        return;
      }

      frontendPort = port;

      // En desarrollo, asumimos que el servidor ya está corriendo
      // En producción, iniciamos el servidor standalone
      if (isDev) {
        console.log(`[Frontend] Using dev server on port ${frontendPort}`);
        resolve(frontendPort);
        return;
      }

      // Ruta al servidor standalone de Next.js
      const serverJsPath = path.join(paths.frontendDist, 'standalone', 'server.js');

      if (!fs.existsSync(serverJsPath)) {
        console.warn(`Frontend server not found at ${serverJsPath}`);
        // Si no existe, resolvemos de todos modos (el backend podría servirlo)
        resolve(frontendPort);
        return;
      }

      const env = {
        ...process.env,
        PORT: frontendPort.toString(),
        NODE_ENV: 'production',
      };

      frontendProcess = spawn('node', [serverJsPath], {
        cwd: path.dirname(serverJsPath),
        env: env,
        stdio: 'pipe',
      });

      if (frontendProcess.stdout) {
        frontendProcess.stdout.on('data', (data: Buffer) => {
          const message = data.toString();
          console.log('[Frontend]', message);
        });
      }

      if (frontendProcess.stderr) {
        frontendProcess.stderr.on('data', (data: Buffer) => {
          console.error('[Frontend Error]', data.toString());
        });
      }

      frontendProcess.on('error', (err: Error) => {
        console.error('[Frontend Process Error]', err);
        // No rechazamos, el backend podría funcionar sin el frontend
        resolve(frontendPort);
      });

      frontendProcess.on('exit', (code: number | null) => {
        console.log(`[Frontend] exited with code ${code}`);
      });

      // Esperar un poco y asumir que inició
      setTimeout(() => {
        console.log(`[Frontend] Started on port ${frontendPort}`);
        resolve(frontendPort);
      }, 3000);
    });
  });
}

// Iniciar el backend NestJS
function startBackend(): Promise<number> {
  return new Promise((resolve, reject) => {
    const paths = getAppPaths();

    console.log('Starting backend...');
    console.log('Backend dist path:', paths.backendDist);

    // Buscar un puerto disponible
    portfinder.getPort({ port: 3001, stopPort: 3010 }, (err, port) => {
      if (err) {
        reject(err);
        return;
      }

      backendPort = port;

      // Configurar variables de entorno para el backend
      const env = {
        ...process.env,
        PORT: backendPort.toString(),
        DATABASE_URL: `file:${path.join(paths.downloadsPath, 'desktop.db')}`,
        DOWNLOAD_PATH: paths.downloadsPath,
        NODE_ENV: 'production',
        DESKTOP_APP: 'true',
        YT_DLP_PATH: paths.ytDlpPath,
      };

      // En desarrollo, iniciar con nest start
      // En producción, ejecutar el JS compilado directamente con node
      const mainJsPath = path.join(paths.backendDist, 'main.js');

      if (!fs.existsSync(mainJsPath)) {
        reject(new Error(`Backend main.js not found at ${mainJsPath}`));
        return;
      }

      backendProcess = spawn('node', [mainJsPath], {
        cwd: paths.backendDist,
        env: env,
        stdio: 'pipe',
      });

      if (backendProcess.stdout) {
        backendProcess.stdout.on('data', (data: Buffer) => {
          const message = data.toString();
          console.log('[Backend]', message);

          // Cuando veamos el mensaje de servidor iniciado, resolvemos
          if (message.includes('SERVIDOR INICIADO') || message.includes('Nest application successfully started')) {
            resolve(backendPort);
          }
        });
      }

      if (backendProcess.stderr) {
        backendProcess.stderr.on('data', (data: Buffer) => {
          console.error('[Backend Error]', data.toString());
        });
      }

      backendProcess.on('error', (err: Error) => {
        console.error('[Backend Process Error]', err);
        reject(err);
      });

      backendProcess.on('exit', (code: number | null) => {
        console.log(`[Backend] exited with code ${code}`);
        if (code && code !== 0) {
          reject(new Error(`Backend exited with code ${code}`));
        }
      });

      // Timeout después de 30 segundos
      setTimeout(() => {
        if (backendProcess && !backendProcess.killed) {
          console.log('[Backend] Timeout, but process is running. Assuming started.');
          resolve(backendPort);
        }
      }, 30000);
    });
  });
}

// Crear la ventana principal
function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1280,
    height: 800,
    minWidth: 800,
    minHeight: 600,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.js'),
      webSecurity: true,
    },
    show: false,
    autoHideMenuBar: true,
  });

  // Mostrar la ventana cuando esté lista
  mainWindow.once('ready-to-show', () => {
    mainWindow?.show();
    if (isDev && mainWindow) {
      mainWindow.webContents.openDevTools();
    }
  });

  // Cerrar la ventana
  mainWindow.on('closed', () => {
    mainWindow = null;
  });

  // Manejar cierre de la app
  mainWindow.on('close', (e) => {
    if (process.platform !== 'darwin') {
      // Detener el frontend y backend al cerrar
      if (frontendProcess && frontendProcess.pid) {
        console.log('Stopping frontend...');
        treeKill(frontendProcess.pid, 'SIGTERM');
        frontendProcess = null;
      }
      if (backendProcess && backendProcess.pid) {
        console.log('Stopping backend...');
        treeKill(backendProcess.pid, 'SIGTERM');
        backendProcess = null;
      }
    }
  });

  return mainWindow;
}

// Cargar la URL del frontend
async function loadFrontend() {
  if (!mainWindow) return;

  try {
    if (isDev) {
      // En desarrollo, cargar el servidor de desarrollo de Next.js
      mainWindow.loadURL('http://localhost:3000');
    } else {
      // En producción, iniciar frontend y backend
      await Promise.all([
        startFrontend(),
        startBackend(),
      ]);

      console.log(`Frontend started on port ${frontendPort}`);
      console.log(`Backend started on port ${backendPort}`);

      // Cargar el frontend
      mainWindow.loadURL(`http://localhost:${frontendPort}`);
    }
  } catch (error) {
    console.error('Failed to start servers:', error);
    mainWindow.loadFile(path.join(__dirname, '../resources/error.html'));
  }
}

// Handlers IPC
ipcMain.handle('get-backend-url', () => {
  return `http://localhost:${backendPort}`;
});

ipcMain.handle('get-frontend-url', () => {
  return `http://localhost:${frontendPort}`;
});

ipcMain.handle('get-downloads-path', () => {
  return getAppPaths().downloadsPath;
});

ipcMain.handle('get-app-version', () => {
  return app.getVersion();
});

ipcMain.handle('open-downloads-folder', () => {
  const paths = getAppPaths();
  const { shell } = require('electron');
  shell.openPath(paths.downloadsPath);
});

// Eventos de la app
app.whenReady().then(async () => {
  ensureDownloadsDir();

  try {
    createWindow();
    await loadFrontend();
  } catch (error) {
    console.error('Error starting app:', error);
  }

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
      loadFrontend();
    }
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('before-quit', () => {
  // Asegurar que el frontend y backend se detengan
  if (frontendProcess && !frontendProcess.killed && frontendProcess.pid) {
    console.log('Stopping frontend before quit...');
    treeKill(frontendProcess.pid, 'SIGTERM');
  }
  if (backendProcess && !backendProcess.killed && backendProcess.pid) {
    console.log('Stopping backend before quit...');
    treeKill(backendProcess.pid, 'SIGTERM');
  }
});

// Manejo de errores no capturados
process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});
