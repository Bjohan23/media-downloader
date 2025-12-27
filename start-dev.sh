#!/bin/bash

# Media Downloader - Development Startup Script

echo "🚀 Starting Media Downloader Development Environment..."

# Check if Redis is running
if ! redis-cli ping > /dev/null 2>&1; then
    echo "📦 Starting Redis..."
    redis-server --daemonize yes
    sleep 2
fi

# Check if FFmpeg is installed
if ! command -v ffmpeg > /dev/null 2>&1; then
    echo "⚠️  Warning: FFmpeg is not installed. Please install FFmpeg for video processing."
    echo "   Ubuntu/Debian: sudo apt install ffmpeg"
    echo "   macOS: brew install ffmpeg"
    echo "   Windows: Download from ffmpeg.org"
fi

# Create downloads directory if it doesn't exist
mkdir -p downloads

# Start backend
echo "🔧 Starting Backend (NestJS)..."
cd backend
bun run start:dev &
BACKEND_PID=$!
cd ..

# Wait for backend to start
sleep 5

# Start frontend
echo "🎨 Starting Frontend (Next.js)..."
bun run dev &
FRONTEND_PID=$!

echo "✅ Services started successfully!"
echo "🌐 Frontend: http://localhost:3000"
echo "🔌 Backend API: http://localhost:3001"
echo "📊 API Documentation: http://localhost:3001/api"
echo ""
echo "Press Ctrl+C to stop all services"

# Function to cleanup on exit
cleanup() {
    echo "🛑 Stopping services..."
    kill $BACKEND_PID 2>/dev/null
    kill $FRONTEND_PID 2>/dev/null
    echo "✅ All services stopped"
    exit 0
}

# Set up signal handlers
trap cleanup SIGINT SIGTERM

# Wait for processes
wait