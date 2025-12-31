@echo off
echo Limpiando caché de Metro y Expo...

REM Detener procesos
taskkill /F /IM node.exe 2>nul

REM Limpiar caché
echo Eliminando node_modules\.cache...
if exist node_modules\.cache rmdir /s /q node_modules\.cache

echo Eliminando .expo...
if exist .expo rmdir /s /q .expo

echo Eliminando dist...
if exist dist rmdir /s /q dist

echo Listo! Ahora ejecuta: npm start -- --reset-cache
pause
