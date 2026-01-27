@echo off
REM Script que solicita permisos de administrador y ejecuta la compilación

echo =====================================================
echo  COMPILACIÓN CON PERMISOS DE ADMINISTRADOR
echo =====================================================
echo.

REM Verificar si tiene permisos de administrador
net session >nul 2>&1
if %errorLevel% == 0 (
    echo ✅ Tiene permisos de administrador
    echo.
    goto :build
) else (
    echo ⚠️  Se necesitan permisos de administrador
    echo.
    goto :requestAdmin
)

:requestAdmin
echo Solicitando permisos de administrador...
powershell -Command "Start-Process '%~f0' -Verb RunAs"
exit /b

:build
echo [1/3] Limpiando build anterior...
call npm run clean
if %errorLevel% neq 0 (
    echo ❌ Error en limpieza
    pause
    exit /b 1
)

echo.
echo [2/3] Compilando aplicación...
call npm run build
if %errorLevel% neq 0 (
    echo ❌ Error en compilación
    pause
    exit /b 1
)

echo.
echo [3/3] Creando instalador Windows...
call npm run dist:windows
if %errorLevel% neq 0 (
    echo ❌ Error al crear instalador
    pause
    exit /b 1
)

echo.
echo =====================================================
echo  ✅ COMPILACIÓN EXITOSA
echo =====================================================
echo.
echo El instalador se encuentra en: release\
echo.
pause
