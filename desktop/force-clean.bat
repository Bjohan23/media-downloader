@echo off
REM Script de limpieza forzada para compilaciones de Electron en Windows
REM Úsalo si el build falla con errores de archivos bloqueados

echo =====================================================
echo  LIMPIEZA FORZADA PARA BUILD DE ELECTRON
echo =====================================================
echo.

echo [1/5] Terminando procesos de Electron...
taskkill /F /IM electron.exe 2>NUL
taskkill /F /IM node.exe 2>NUL
timeout /t 2 /nobreak >NUL

echo [2/5] Terminando procesos de Windows Explorer relacionados...
REM Esto ayuda a liberar bloqueos de archivos
echo. (Explorer no se cerrará, solo se refrescará)

echo [3/5] Eliminando directorio release...
if exist release (
    rd /s /q release 2>NUL
    timeout /t 2 /nobreak >NUL
)

echo [4/5] Limpiando archivos temporales...
if exist "%TEMP%\electron-*" (
    del /s /q "%TEMP%\electron-*" 2>NUL
)

echo [5/5] Verificando que release esté eliminado...
if exist release (
    echo.
    echo ⚠️  ADVERTENCIA: El directorio release aún existe
    echo.
    echo Posibles causas:
    echo   - El explorador de archivos está abierto en la carpeta release
    echo   - Un antivirus está escaneando los archivos
    echo   - Windows tiene un bloqueo del sistema de archivos
    echo.
    echo Soluciones:
    echo   1. Cierra el explorador de archivos si está abierto en la carpeta
    echo   2. Ejecuta este script como Administrador
    echo   3. Reinicia el equipo
    echo.
) else (
    echo ✅ Limpieza completada exitosamente
)

echo.
echo =====================================================
echo  Ahora puedes ejecutar: npm run dist:windows
echo =====================================================
echo.
pause
