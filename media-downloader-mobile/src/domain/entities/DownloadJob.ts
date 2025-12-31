/**
 * Estados posibles de un job de descarga
 */
export enum DownloadStatus {
  PENDING = 'pending',
  PROCESSING = 'processing',
  COMPLETED = 'completed',
  FAILED = 'failed',
}

/**
 * Plataformas soportadas
 */
export enum DownloadPlatform {
  YOUTUBE = 'youtube',
  INSTAGRAM = 'instagram',
  TIKTOK = 'tiktok',
  TWITTER = 'twitter',
  FACEBOOK = 'facebook',
}

/**
 * Tipos de descarga
 */
export enum DownloadType {
  VIDEO = 'video',
  AUDIO = 'audio',
}

/**
 * Calidades disponibles
 */
export enum DownloadQuality {
  LOW = '360p',
  MEDIUM = '720p',
  HIGH = '1080p',
  ULTRA = '4k',
}

/**
 * Formatos de video
 */
export enum VideoFormat {
  MP4 = 'mp4',
  WEBM = 'webm',
  MKV = 'mkv',
}

/**
 * Formatos de audio
 */
export enum AudioFormat {
  MP3 = 'mp3',
  M4A = 'm4a',
  WAV = 'wav',
  FLAC = 'flac',
}

/**
 * Entidad: Job de descarga
 */
export class DownloadJob {
  constructor(
    public readonly id: string,
    public readonly url: string,
    public readonly platform: DownloadPlatform,
    public readonly type: DownloadType,
    public readonly quality: DownloadQuality,
    public readonly format: string,
    public status: DownloadStatus,
    public progress: number,
    public filename: string | null,
    public errorMessage: string | null,
    public readonly createdAt: Date,
    public updatedAt: Date,
  ) {}

  /**
   * Actualizar el progreso de la descarga
   */
  updateProgress(progress: number): DownloadJob {
    return new DownloadJob(
      this.id,
      this.url,
      this.platform,
      this.type,
      this.quality,
      this.format,
      this.status,
      Math.min(100, Math.max(0, progress)),
      this.filename,
      this.errorMessage,
      this.createdAt,
      new Date(),
    );
  }

  /**
   * Marcar como completado
   */
  markAsCompleted(filename: string): DownloadJob {
    return new DownloadJob(
      this.id,
      this.url,
      this.platform,
      this.type,
      this.quality,
      this.format,
      DownloadStatus.COMPLETED,
      100,
      filename,
      null,
      this.createdAt,
      new Date(),
    );
  }

  /**
   * Marcar como fallido
   */
  markAsFailed(errorMessage: string): DownloadJob {
    return new DownloadJob(
      this.id,
      this.url,
      this.platform,
      this.type,
      this.quality,
      this.format,
      DownloadStatus.FAILED,
      this.progress,
      null,
      errorMessage,
      this.createdAt,
      new Date(),
    );
  }

  /**
   * Verificar si está en progreso
   */
  isInProgress(): boolean {
    return this.status === DownloadStatus.PROCESSING;
  }

  /**
   * Verificar si está completado
   */
  isCompleted(): boolean {
    return this.status === DownloadStatus.COMPLETED;
  }

  /**
   * Verificar si falló
   */
  hasFailed(): boolean {
    return this.status === DownloadStatus.FAILED;
  }

  /**
   * Crear desde DTO (API response)
   */
  static fromDTO(dto: DownloadJobDTO): DownloadJob {
    return new DownloadJob(
      dto.jobId,
      dto.url,
      dto.platform as DownloadPlatform,
      dto.type as DownloadType,
      dto.quality as DownloadQuality,
      dto.format,
      dto.status as DownloadStatus,
      dto.progress,
      dto.filename,
      dto.errorMessage,
      new Date(dto.createdAt),
      new Date(dto.updatedAt || dto.createdAt),
    );
  }

  /**
   * Convertir a DTO
   */
  toDTO(): DownloadJobDTO {
    return {
      jobId: this.id,
      url: this.url,
      platform: this.platform,
      type: this.type,
      quality: this.quality,
      format: this.format,
      status: this.status,
      progress: this.progress,
      filename: this.filename,
      errorMessage: this.errorMessage,
      createdAt: this.createdAt.toISOString(),
      updatedAt: this.updatedAt.toISOString(),
    };
  }
}

/**
 * DTO para API response
 */
export interface DownloadJobDTO {
  jobId: string;
  url: string;
  platform: string;
  type: DownloadType;
  quality: DownloadQuality;
  format: string;
  status: string;
  progress: number;
  filename: string | null;
  errorMessage: string | null;
  createdAt: string;
  updatedAt?: string;
}
