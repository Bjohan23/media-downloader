import { DownloadPlatform, DownloadType, DownloadQuality, VideoFormat, AudioFormat } from './DownloadJob';

/**
 * Solicitud de descarga (entity)
 */
export class DownloadRequest {
  constructor(
    public readonly url: string,
    public readonly platform: DownloadPlatform,
    public readonly type: DownloadType,
    public readonly quality: DownloadQuality,
    public readonly format: string,
  ) {}

  /**
   * Validar la solicitud
   */
  validate(): { valid: boolean; error?: string } {
    if (!this.url || this.url.trim().length === 0) {
      return { valid: false, error: 'URL is required' };
    }

    if (!this.isValidUrl(this.url)) {
      return { valid: false, error: 'Invalid URL format' };
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
    url: string,
    platform: DownloadPlatform,
    quality: DownloadQuality,
    format: VideoFormat = VideoFormat.MP4,
  ): DownloadRequest {
    return new DownloadRequest(url, platform, DownloadType.VIDEO, quality, format);
  }

  /**
   * Crear solicitud de audio
   */
  static createAudioRequest(
    url: string,
    platform: DownloadPlatform,
    quality: DownloadQuality,
    format: AudioFormat = AudioFormat.MP3,
  ): DownloadRequest {
    return new DownloadRequest(url, platform, DownloadType.AUDIO, quality, format);
  }

  /**
   * Convertir a DTO para API
   */
  toDTO(): DownloadRequestDTO {
    return {
      url: this.url,
      platform: this.platform,
      type: this.type,
      quality: this.quality,
      format: this.format,
    };
  }
}

/**
 * DTO para API request
 */
export interface DownloadRequestDTO {
  url: string;
  platform: string;
  type: DownloadType;
  quality: DownloadQuality;
  format: string;
}
