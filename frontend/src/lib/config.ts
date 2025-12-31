export const config = {
  apiUrl: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001',
  wsUrl: process.env.NEXT_PUBLIC_WS_URL || 'http://localhost:3001',
  maxConcurrentDownloads: 3,
  supportedFormats: {
    video: ['mp4', 'webm', 'avi', 'mov'],
    audio: ['mp3', 'm4a', 'wav'],
  },
  supportedQualities: ['highest', '1080p', '720p', '360p', '144p', 'lowest'],
  supportedPlatforms: [
    'youtube.com',
    'youtu.be',
    'tiktok.com',
    'instagram.com',
    'facebook.com',
    'twitter.com',
    'vimeo.com',
    'twitch.tv',
  ],
};