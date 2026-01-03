#!/bin/bash

# Script para descargar yt-dlp para todas las plataformas

echo "Downloading yt-dlp binaries..."

YTDLP_VERSION="latest"
BINARIES_DIR="$(dirname "$0")/binaries"

# Crear directorios
mkdir -p "$BINARIES_DIR/windows"
mkdir -p "$BINARIES_DIR/macos"
mkdir -p "$BINARIES_DIR/linux"

# Windows
echo "Downloading yt-dlp for Windows..."
curl -L "https://github.com/yt-dlp/yt-dlp/releases/latest/download/yt-dlp.exe" -o "$BINARIES_DIR/windows/yt-dlp.exe"
if [ $? -eq 0 ]; then
  echo "✓ Windows binary downloaded successfully"
else
  echo "✗ Failed to download Windows binary"
fi

# macOS
echo "Downloading yt-dlp for macOS..."
curl -L "https://github.com/yt-dlp/yt-dlp/releases/latest/download/yt-dlp" -o "$BINARIES_DIR/macos/yt-dlp"
if [ $? -eq 0 ]; then
  chmod +x "$BINARIES_DIR/macos/yt-dlp"
  echo "✓ macOS binary downloaded successfully"
else
  echo "✗ Failed to download macOS binary"
fi

# Linux
echo "Downloading yt-dlp for Linux..."
curl -L "https://github.com/yt-dlp/yt-dlp/releases/latest/download/yt-dlp" -o "$BINARIES_DIR/linux/yt-dlp"
if [ $? -eq 0 ]; then
  chmod +x "$BINARIES_DIR/linux/yt-dlp"
  echo "✓ Linux binary downloaded successfully"
else
  echo "✗ Failed to download Linux binary"
fi

echo ""
echo "All binaries downloaded to: $BINARIES_DIR"
echo "Verify with: ls -la $BINARIES_DIR/*/"
