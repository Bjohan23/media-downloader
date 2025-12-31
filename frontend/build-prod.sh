#!/bin/bash

# Media Downloader - Production Build Script

echo "🏗️  Building Media Downloader for Production..."

# Check if Redis is running
if ! redis-cli ping > /dev/null 2>&1; then
    echo "❌ Redis is not running. Please start Redis server first."
    exit 1
fi

# Check if FFmpeg is installed
if ! command -v ffmpeg > /dev/null 2>&1; then
    echo "❌ FFmpeg is not installed. Please install FFmpeg for video processing."
    exit 1
fi

# Create downloads directory
mkdir -p downloads

# Build backend
echo "🔧 Building Backend..."
cd backend
bun install
bun run build
cd ..

# Build frontend
echo "🎨 Building Frontend..."
bun install
bun run build

echo "✅ Build completed successfully!"
echo ""
echo "To start production servers:"
echo "1. Backend: cd backend && bun run start:prod"
echo "2. Frontend: bun run start"
echo ""
echo "Make sure to set production environment variables!"