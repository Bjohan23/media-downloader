#!/usr/bin/env node

/**
 * Script de limpieza profesional para builds de Electron en Windows
 * Elimina procesos bloqueados y limpia directorios de compilación
 * Usa handle.exe para cerrar handles de archivos bloqueados
 */

const { execSync, spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

const releaseDir = path.join(__dirname, '..', 'release');
const handleExe = path.join(__dirname, '..', 'handle64.exe');

console.log('🧹 Limpiando antes de compilar...\n');

// 1. Matar procesos de Electron que puedan estar corriendo
console.log('📌 Buscando procesos de Electron activos...');
try {
  if (process.platform === 'win32') {
    try {
      const result = execSync('tasklist | findstr electron.exe', { encoding: 'utf-8', stdio: 'pipe' });
      if (result.trim()) {
        console.log('⚠️  Procesos de Electron encontrados, terminando...');
        execSync('taskkill /F /IM electron.exe', { stdio: 'ignore' });
        console.log('✅ Procesos de Electron terminados\n');
      }
    } catch (e) {
      console.log('✅ No hay procesos de Electron corriendo\n');
    }
  }
} catch (error) {
  console.log('⚠️  No se pudieron verificar procesos de Electron\n');
}

// 2. Cerrar handles de archivos bloqueados usando handle.exe
console.log('🔓 Cerrando handles de archivos bloqueados...');
if (process.platform === 'win32' && fs.existsSync(handleExe)) {
  try {
    // Buscar handles de app.asar en la carpeta release
    const handleOutput = execSync(`"${handleExe}" -a app.asar`, { encoding: 'utf-8', stdio: 'pipe' });

    const lines = handleOutput.split('\n').filter(line => line.includes('release') && line.includes('app.asar'));

    if (lines.length > 0) {
      console.log(`⚠️  Encontrados ${lines.length} handles bloqueados, cerrando...`);

      for (const line of lines) {
        // Extraer el handle ID (formato: "ABC:")
        const handleMatch = line.match(/([0-9A-F]+:)\s/);
        if (handleMatch) {
          const handleId = handleMatch[1];

          // Extraer el PID
          const pidMatch = line.match(/pid:\s*(\d+)/);
          if (pidMatch) {
            const pid = pidMatch[1];

            try {
              // Cerrar el handle específico sin matar el proceso
              execSync(`"${handleExe}" -p ${pid} -c ${handleId} -y`, {
                encoding: 'utf-8',
                stdio: 'pipe'
              });
              console.log(`  ✅ Handle ${handleId} cerrado (PID: ${pid})`);
            } catch (e) {
              console.log(`  ⚠️  No se pudo cerrar handle ${handleId}`);
            }
          }
        }
      }
      console.log('');
    } else {
      console.log('✅ No hay handles bloqueados por VSCode\n');
    }
  } catch (error) {
    console.log('⚠️  No se pudieron cerrar handles (ejecuta como Admin)\n');
  }
} else {
  console.log('ℹ️  handle.exe no encontrado, omitiendo cierre de handles\n');
}

// 3. Esperar a que se liberen los archivos
console.log('⏳ Esperando a que se liberen los archivos...');
try {
  if (process.platform === 'win32') {
    execSync('ping 127.0.0.1 -n 3 > NUL', { stdio: 'ignore' });
  }
} catch (e) {
  // Ignore timeout errors
}

// 4. Eliminar directorio release
console.log('📁 Eliminando directorio release...');
if (fs.existsSync(releaseDir)) {
  try {
    fs.rmSync(releaseDir, { recursive: true, force: true, maxRetries: 5, retryDelay: 1000 });
    console.log('✅ Directorio release eliminado\n');
  } catch (error) {
    console.log('❌ No se pudo eliminar release automáticamente\n');
    console.log('💡 SOLUCIONES:\n');
    console.log('1. Cierra VSCode y ejecuta: npm run dist:windows');
    console.log('2. Ejecuta: ./force-clean.bat (como Administrador)');
    console.log('3. Reinicia el equipo\n');
    process.exit(1);
  }
} else {
  console.log('✅ Directorio release no existe, continuando...\n');
}

console.log('✨ Limpieza completada exitosamente\n');
