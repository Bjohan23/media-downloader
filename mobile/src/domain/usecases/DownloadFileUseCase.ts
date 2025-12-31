import { DownloadRepository } from '../repositories';
import { Result } from './CreateDownloadUseCase';

/**
 * Caso de uso: Descargar archivo completado
 */
export class DownloadFileUseCase {
  constructor(private readonly downloadRepository: DownloadRepository) {}

  /**
   * Ejecutar el caso de uso
   */
  async execute(
    filename: string,
    destinationPath: string,
  ): Promise<Result<string>> {
    try {
      if (!filename) {
        return {
          success: false,
          error: 'Filename is required',
        };
      }

      if (!destinationPath) {
        return {
          success: false,
          error: 'Destination path is required',
        };
      }

      await this.downloadRepository.downloadFile(filename, destinationPath);

      return {
        success: true,
        data: destinationPath,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to download file',
      };
    }
  }
}
