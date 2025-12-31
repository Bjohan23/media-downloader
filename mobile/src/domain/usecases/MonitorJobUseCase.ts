import { DownloadRepository } from '../repositories';
import { DownloadJob } from '../entities';
import { Result } from './CreateDownloadUseCase';

/**
 * Configuración para el monitoreo
 */
export interface MonitorConfig {
  interval?: number; // Intervalo en ms (default: 2000)
  maxAttempts?: number; // Máximo número de intentos (default: 150 = 5 min)
  onProgress?: (job: DownloadJob) => void;
  onComplete?: (job: DownloadJob) => void;
  onError?: (job: DownloadJob) => void;
}

/**
 * Caso de uso: Monitorear job de descarga
 */
export class MonitorJobUseCase {
  constructor(private readonly downloadRepository: DownloadRepository) {}

  /**
   * Ejecutar el caso de uso con polling
   */
  async execute(
    jobId: string,
    config: MonitorConfig = {},
  ): Promise<Result<DownloadJob>> {
    const {
      interval = 2000,
      maxAttempts = 150,
      onProgress,
      onComplete,
      onError,
    } = config;

    let attempts = 0;

    try {
      while (attempts < maxAttempts) {
        const job = await this.downloadRepository.pollJobStatus(jobId, interval);

        // Notificar progreso
        if (onProgress && job.isInProgress()) {
          onProgress(job);
        }

        // Verificar si completó
        if (job.isCompleted()) {
          if (onComplete) {
            onComplete(job);
          }
          return {
            success: true,
            data: job,
          };
        }

        // Verificar si falló
        if (job.hasFailed()) {
          if (onError) {
            onError(job);
          }
          return {
            success: false,
            error: job.errorMessage || 'Download failed',
          };
        }

        attempts++;
      }

      // Timeout después de maxAttempts
      return {
        success: false,
        error: 'Download monitoring timeout',
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to monitor job',
      };
    }
  }

  /**
   * Ejecutar el caso de uso sin polling (una sola petición)
   */
  async executeOnce(jobId: string): Promise<Result<DownloadJob>> {
    try {
      const job = await this.downloadRepository.getJobById(jobId);

      if (!job) {
        return {
          success: false,
          error: 'Job not found',
        };
      }

      return {
        success: true,
        data: job,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to get job status',
      };
    }
  }
}
