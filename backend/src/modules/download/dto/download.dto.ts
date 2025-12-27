import { IsString, IsOptional, IsEnum, IsArray } from 'class-validator';

export enum MediaType {
  VIDEO = 'video',
  AUDIO = 'audio',
}

export enum Quality {
  AUTO = 'auto',
  HIGHEST = 'highest',
  LOWEST = 'lowest',
  P144 = '144p',
  P360 = '360p',
  P720 = '720p',
  P1080 = '1080p',
  P4K = '4k',
}

export enum Format {
  MP4 = 'mp4',
  WEBM = 'webm',
  MP3 = 'mp3',
  M4A = 'm4a',
  AVI = 'avi',
  MOV = 'mov',
}

export class DownloadRequestDto {
  @IsArray()
  @IsString({ each: true })
  urls: string[];

  @IsEnum(MediaType)
  mediaType: MediaType;

  @IsOptional()
  @IsEnum(Quality)
  quality?: Quality = Quality.HIGHEST;

  @IsOptional()
  @IsEnum(Format)
  format?: Format = Format.MP4;
}

export class DownloadJobDto {
  id: string;
  url: string;
  title: string;
  duration: string;
  thumbnail: string;
  mediaType: MediaType;
  quality: Quality;
  format: Format;
  status: 'pending' | 'downloading' | 'completed' | 'failed';
  progress: number;
  downloadPath?: string;
  errorMessage?: string;
  createdAt: Date;
  completedAt?: Date;
}