export interface DownloadJob {
  id: string;
  url: string;
  title: string;
  duration: string;
  thumbnail: string;
  mediaType: 'video' | 'audio';
  quality: string;
  format: string;
  status: 'pending' | 'downloading' | 'completed' | 'failed';
  progress: number;
  downloadPath?: string;
  errorMessage?: string;
  createdAt: Date;
  completedAt?: Date;
}

export interface DownloadRequest {
  urls: string[];
  mediaType: 'video' | 'audio';
  quality?: string;
  format?: string;
}

export interface User {
  id: string;
  email: string;
  name?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface AuthResponse {
  user: User;
  token: string;
}