import { DownloadRepository } from '../repositories';
import { DownloadRequest, DownloadJob } from '../entities';

/**
 * Caso de uso: Crear nueva descarga
 */
export class CreateDownloadUseCase {
  constructor(private readonly downloadRepository: DownloadRepository) {}

  /**
   * Ejecutar el caso de uso
   */
  async execute(request: DownloadRequest): Promise<Result<DownloadJob>> {
    try {
      // Validar solicitud
      const validation = request.validate();
      if (!validation.valid) {
        return {
          success: false,
          error: validation.error || 'Invalid request',
        };
      }

      // Crear descarga
      const job = await this.downloadRepository.createDownload(request);

      return {
        success: true,
        data: job,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to create download',
      };
    }
  }
}

/**
 * Resultado de un caso de uso
 */
export interface Result<T> {
  success: boolean;
  data?: T;
  error?: string;
}
