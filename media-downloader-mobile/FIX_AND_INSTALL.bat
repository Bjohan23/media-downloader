@echo off
color 0A
echo ========================================
echo  CORRIGIENDO ERRORES + INSTALANDO
echo ========================================
echo.

echo [1/4] Creando estructura de carpetas...
if not exist assets mkdir assets
if not exist assets\images mkdir assets\images
echo. > assets\.gitkeep
echo. > assets\images\.gitkeep
echo OK - Carpetas creadas
echo.

echo [2/4] Limpiando caches...
if exist node_modules\.cache rmdir /s /q node_modules\.cache
if exist .expo rmdir /s /q .expo
echo OK - Caches limpiados
echo.

echo [3/4] Instalando dependencias actualizadas...
call npm install
echo.

echo [4/4] Verificando instalacion...
echo.
echo ========================================
echo  LISTO! Ahora ejecuta:
echo  npm start -- --reset-cache
echo ========================================
echo.
pause
