@echo off
echo Creando carpeta assets necesaria...
if not exist assets mkdir assets
echo. > assets\.gitkeep
echo Carpeta assets creada!
echo Ahora ejecuta: npm start -- --reset-cache
pause
