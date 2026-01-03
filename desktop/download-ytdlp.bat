@echo off
REM Script para descargar yt-dlp para todas las plataformas (Windows)

echo Downloading yt-dlp binaries...

set BINARIES_DIR=%~dp0binaries

REM Crear directorios
if not exist "%BINARIES_DIR%\windows" mkdir "%BINARIES_DIR%\windows"
if not exist "%BINARIES_DIR%\macos" mkdir "%BINARIES_DIR%\macos"
if not exist "%BINARIES_DIR%\linux" mkdir "%BINARIES_DIR%\linux"

REM Windows
echo Downloading yt-dlp for Windows...
powershell -Command "Invoke-WebRequest -Uri 'https://github.com/yt-dlp/yt-dlp/releases/latest/download/yt-dlp.exe' -OutFile '%BINARIES_DIR%\windows\yt-dlp.exe'"
if %ERRORLEVEL% EQU 0 (
  echo [OK] Windows binary downloaded successfully
) else (
  echo [ERROR] Failed to download Windows binary
)

REM macOS
echo Downloading yt-dlp for macOS...
powershell -Command "Invoke-WebRequest -Uri 'https://github.com/yt-dlp/yt-dlp/releases/latest/download/yt-dlp' -OutFile '%BINARIES_DIR%\macos\yt-dlp'"
if %ERRORLEVEL% EQU 0 (
  echo [OK] macOS binary downloaded successfully
) else (
  echo [ERROR] Failed to download macOS binary
)

REM Linux
echo Downloading yt-dlp for Linux...
powershell -Command "Invoke-WebRequest -Uri 'https://github.com/yt-dlp/yt-dlp/releases/latest/download/yt-dlp' -OutFile '%BINARIES_DIR%\linux\yt-dlp'"
if %ERRORLEVEL% EQU 0 (
  echo [OK] Linux binary downloaded successfully
) else (
  echo [ERROR] Failed to download Linux binary
)

echo.
echo All binaries downloaded to: %BINARIES_DIR%
echo Verify with: dir /b %BINARIES_DIR%\*
echo.
pause
