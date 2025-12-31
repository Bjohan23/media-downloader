import { DownloadRepository } from '../repositories';
import { DownloadJob } from '../entities';
import { Result } from './CreateDownloadUseCase';

/**
 * Caso de uso: Obtener todas las descargas
 */
export class GetAllDownloadsUseCase {
  constructor(private readonly downloadRepository: DownloadRepository) {}

  /**
   * Ejecutar el caso de uso
   */
  async execute(): Promise<Result<DownloadJob[]>> {
    try {
      const jobs = await this.downloadRepository.getAllJobs();

      return {
        success: true,
        data: jobs,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch downloads',
      };
    }
  }
}

/**
 * Caso de uso: Obtener descargas por estado
 */
export class GetDownloadsByStatusUseCase {
  constructor(private readonly downloadRepository: DownloadRepository) {}

  /**
   * Ejecutar el caso de uso
   */
  async execute(status: string): Promise<Result<DownloadJob[]>> {
    try {
      const jobs = await this.downloadRepository.getJobsByStatus(status);

      return {
        success: true,
        data: jobs,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch downloads',
      };
    }
  }
}
