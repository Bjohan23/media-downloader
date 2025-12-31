@echo off
color 0A
echo ========================================
echo  LIMPIEZA COMPLETA + REINICIO
echo ========================================
echo.

echo [1/5] Creando carpeta assets...
if not exist assets mkdir assets
echo. > assets\.gitkeep
echo OK - Carpeta assets creada
echo.

echo [2/5] Limpiando caches...
if exist node_modules\.cache (
    rmdir /s /q node_modules\.cache
    echo OK - node_modules\.cache eliminado
) else (
    echo SKIP - node_modules\.cache no existe
)
echo.

if exist .expo (
    rmdir /s /q .expo
    echo OK - .expo eliminado
) else (
    echo SKIP - .expo no existe
)
echo.

if exist dist (
    rmdir /s /q dist
    echo OK - dist eliminado
) else (
    echo SKIP - dist no existe
)
echo.

echo [3/5] Verificando dependencias...
if not exist node_modules (
    echo INSTALL - Instalando dependencias...
    call npm install
) else (
    echo OK - node_modules existe
)
echo.

echo [4/5] Verificando babel-plugin-module-resolver...
npm list babel-plugin-module-resolver >nul 2>&1
if errorlevel 1 (
    echo INSTALL - Instalando babel-plugin-module-resolver...
    call npm install --save-dev babel-plugin-module-resolver
) else (
    echo OK - babel-plugin-module-resolver instalado
)
echo.

echo [5/5] Iniciando con reset de caché...
echo.
echo ========================================
echo  LISTO! Abre Expo Go y escanea el QR
echo ========================================
echo.
echo Presiona Ctrl+C para detener
echo.

call npm start -- --reset-cache
