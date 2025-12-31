/**
 * Solicitud de descarga (entity)
 * Estructura coincidente con el backend
 */
export class DownloadRequest {
  constructor(
    public readonly urls: string[],
    public readonly mediaType: MediaType,
    public readonly quality: string = 'highest',
    public readonly format: string = 'mp4',
  ) {}

  /**
   * Validar la solicitud
   */
  validate(): { valid: boolean; error?: string } {
    if (!this.urls || this.urls.length === 0) {
      return { valid: false, error: 'At least one URL is required' };
    }

    for (const url of this.urls) {
      if (!url || url.trim().length === 0) {
        return { valid: false, error: 'All URLs must be valid' };
      }

      if (!this.isValidUrl(url)) {
        return { valid: false, error: `Invalid URL format: ${url}` };
      }
    }

    return { valid: true };
  }

  /**
   * Validar formato de URL
   */
  private isValidUrl(url: string): boolean {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Crear solicitud de video
   */
  static createVideoRequest(
    urls: string[],
    quality: string = 'highest',
    format: string = 'mp4',
  ): DownloadRequest {
    return new DownloadRequest(urls, MediaType.VIDEO, quality, format);
  }

  /**
   * Crear solicitud de audio
   */
  static createAudioRequest(
    urls: string[],
    quality: string = 'highest',
    format: string = 'mp3',
  ): DownloadRequest {
    return new DownloadRequest(urls, MediaType.AUDIO, quality, format);
  }

  /**
   * Crear desde una sola URL
   */
  static createSingle(
    url: string,
    mediaType: MediaType,
    quality: string = 'highest',
    format: string = 'mp4',
  ): DownloadRequest {
    return new DownloadRequest([url], mediaType, quality, format);
  }

  /**
   * Convertir a DTO para API
   */
  toDTO(): DownloadRequestDTO {
    return {
      urls: this.urls,
      mediaType: this.mediaType,
      quality: this.quality,
      format: this.format,
    };
  }
}

/**
 * DTO para API request (coincidente con backend)
 */
export interface DownloadRequestDTO {
  urls: string[];
  mediaType: MediaType;
  quality?: string;
  format?: string;
}

/**
 * Tipos de media (coincidente con backend)
 */
export enum MediaType {
  VIDEO = 'video',
  AUDIO = 'audio',
}

/**
 * Calidades disponibles (coincidente con backend)
 */
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

/**
 * Formatos disponibles (coincidente con backend)
 */
export enum Format {
  MP4 = 'mp4',
  WEBM = 'webm',
  MP3 = 'mp3',
  M4A = 'm4a',
  AVI = 'avi',
  MOV = 'mov',
}
