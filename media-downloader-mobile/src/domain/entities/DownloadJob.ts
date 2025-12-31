/**
 * Estados posibles de un job de descarga (coincidente con backend)
 */
export enum DownloadStatus {
  PENDING = 'pending',
  DOWNLOADING = 'downloading',
  COMPLETED = 'completed',
  FAILED = 'failed',
}

/**
 * Plataformas soportadas (detectadas automáticamente por el backend)
 */
export enum DownloadPlatform {
  YOUTUBE = 'youtube',
  INSTAGRAM = 'instagram',
  TIKTOK = 'tiktok',
  TWITTER = 'twitter',
  FACEBOOK = 'facebook',
}

/**
 * Tipos de media (coincidente con backend)
 */
export enum MediaType {
  VIDEO = 'video',
  AUDIO = 'audio',
}

/**
 * Entidad: Job de descarga
 * Estructura coincidente con el backend
 */
export class DownloadJob {
  constructor(
    public readonly id: string,
    public readonly url: string,
    public readonly title: string,
    public readonly duration: string,
    public readonly thumbnail: string,
    public readonly mediaType: MediaType,
    public readonly quality: string,
    public readonly format: string,
    public status: DownloadStatus,
    public progress: number,
    public downloadPath: string | null,
    public errorMessage: string | null,
    public readonly createdAt: Date,
    public completedAt: Date | null,
  ) {}

  /**
   * Actualizar el progreso de la descarga
   */
  updateProgress(progress: number, status?: DownloadStatus): DownloadJob {
    return new DownloadJob(
      this.id,
      this.url,
      this.title,
      this.duration,
      this.thumbnail,
      this.mediaType,
      this.quality,
      this.format,
      status || this.status,
      Math.min(100, Math.max(0, progress)),
      this.downloadPath,
      this.errorMessage,
      this.createdAt,
      this.completedAt,
    );
  }

  /**
   * Marcar como completado
   */
  markAsCompleted(downloadPath: string): DownloadJob {
    return new DownloadJob(
      this.id,
      this.url,
      this.title,
      this.duration,
      this.thumbnail,
      this.mediaType,
      this.quality,
      this.format,
      DownloadStatus.COMPLETED,
      100,
      downloadPath,
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
      this.title,
      this.duration,
      this.thumbnail,
      this.mediaType,
      this.quality,
      this.format,
      DownloadStatus.FAILED,
      this.progress,
      null,
      errorMessage,
      this.createdAt,
      null,
    );
  }

  /**
   * Verificar si está en progreso
   */
  isInProgress(): boolean {
    return this.status === DownloadStatus.DOWNLOADING;
  }

  /**
   * Verificar si está pendiente
   */
  isPending(): boolean {
    return this.status === DownloadStatus.PENDING;
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
   * Obtener nombre de archivo desde downloadPath
   */
  getFilename(): string | null {
    if (!this.downloadPath) return null;
    const parts = this.downloadPath.split(/[/\\]/);
    return parts[parts.length - 1] || null;
  }

  /**
   * Crear desde DTO (API response)
   */
  static fromDTO(dto: DownloadJobDTO): DownloadJob {
    return new DownloadJob(
      dto.id,
      dto.url,
      dto.title || '',
      dto.duration || '',
      dto.thumbnail || '',
      dto.mediaType as MediaType,
      dto.quality,
      dto.format,
      dto.status as DownloadStatus,
      dto.progress,
      dto.downloadPath || null,
      dto.errorMessage || null,
      new Date(dto.createdAt),
      dto.completedAt ? new Date(dto.completedAt) : null,
    );
  }

  /**
   * Convertir a DTO
   */
  toDTO(): DownloadJobDTO {
    return {
      id: this.id,
      url: this.url,
      title: this.title,
      duration: this.duration,
      thumbnail: this.thumbnail,
      mediaType: this.mediaType,
      quality: this.quality,
      format: this.format,
      status: this.status,
      progress: this.progress,
      downloadPath: this.downloadPath,
      errorMessage: this.errorMessage,
      createdAt: this.createdAt.toISOString(),
      completedAt: this.completedAt?.toISOString(),
    };
  }
}

/**
 * DTO para API response (coincidente con backend)
 */
export interface DownloadJobDTO {
  id: string;
  url: string;
  title: string;
  duration: string;
  thumbnail: string;
  mediaType: MediaType;
  quality: string;
  format: string;
  status: string;
  progress: number;
  downloadPath?: string;
  errorMessage?: string;
  createdAt: string;
  completedAt?: string;
}
