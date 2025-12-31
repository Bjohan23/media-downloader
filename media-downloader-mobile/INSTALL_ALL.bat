@echo off
color 0A
echo ========================================
echo  INSTALANDO DEPENDENCIAS EXPO SDK 54
echo ========================================
echo.

echo [1/3] Limpiando instalacion anterior...
if exist node_modules\.cache rmdir /s /q node_modules\.cache
if exist .expo rmdir /s /q .expo
echo OK - Caches limpiados
echo.

echo [2/3] Instalando dependencias...
call npm install
echo.

echo [3/3] Verificando instalacion...
npm list @babel/preset-expo >nul 2>&1
if errorlevel 1 (
    echo ERROR: @babel/preset-expo no se instalo correctamente
    echo Ejecuta: npm install --save-dev @babel/preset-expo
) else (
    echo OK - @babel/preset-expo instalado
)
echo.

echo ========================================
echo  LISTO! Ahora ejecuta:
echo  npm start
echo ========================================
echo.
pause
