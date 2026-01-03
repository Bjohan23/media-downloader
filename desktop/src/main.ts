import { app, BrowserWindow, ipcMain } from 'electron';
import * as path from 'path';
import * as fs from 'fs';
import { spawn, ChildProcess } from 'child_process';
import * as portfinder from 'portfinder';
import treeKill = require('tree-kill');

let mainWindow: BrowserWindow | null = null;
let backendProcess: ChildProcess | null = null;
let backendPort = 3001;
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
      // Detener el backend al cerrar
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

  if (isDev) {
    // En desarrollo, cargar el servidor de desarrollo de Next.js
    mainWindow.loadURL('http://localhost:3000');
  } else {
    // En producción, esperar a que el backend inicie y luego cargar
    try {
      await startBackend();
      console.log(`Backend started on port ${backendPort}`);

      // Cargar el frontend de Next.js standalone
      // Next.js se servirá desde el backend usando ServeStaticModule
      mainWindow.loadURL(`http://localhost:${backendPort}`);
    } catch (error) {
      console.error('Failed to start backend:', error);
      mainWindow.loadFile(path.join(__dirname, '../resources/error.html'));
    }
  }
}

// Handlers IPC
ipcMain.handle('get-backend-url', () => {
  return `http://localhost:${backendPort}`;
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
  // Asegurar que el backend se detenga
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
