import { DownloadRepository } from '@/domain/repositories';
import { DownloadJob, DownloadRequest } from '@/domain/entities';
import { apiClient } from '../services';
import API_CONFIG from '../services/api.config';
import * as FileSystem from 'expo-file-system';

/**
 * Implementación del repositorio de descargas
 */
export class DownloadRepositoryImpl implements DownloadRepository {
  /**
   * Crear nuevo job de descarga
   */
  async createDownload(request: DownloadRequest): Promise<DownloadJob> {
    try {
      const dto = request.toDTO();
      const response = await apiClient.post<any[]>(
        API_CONFIG.endpoints.downloads.create,
        dto
      );

      if (!response || response.length === 0) {
        throw new Error('No job created');
      }

      return DownloadJob.fromDTO(response[0]);
    } catch (error) {
      console.error('[DownloadRepository] Error creating download:', error);
      throw error;
    }
  }

  /**
   * Obtener todos los jobs
   */
  async getAllJobs(): Promise<DownloadJob[]> {
    try {
      const response = await apiClient.get<any[]>(
        API_CONFIG.endpoints.downloads.getAll
      );

      return response.map((dto) => DownloadJob.fromDTO(dto));
    } catch (error) {
      console.error('[DownloadRepository] Error fetching jobs:', error);
      throw error;
    }
  }

  /**
   * Obtener jobs por estado
   */
  async getJobsByStatus(status: string): Promise<DownloadJob[]> {
    try {
      const response = await apiClient.get<any[]>(
        `${API_CONFIG.endpoints.downloads.getAll}?status=${status}`
      );

      return response.map((dto) => DownloadJob.fromDTO(dto));
    } catch (error) {
      console.error('[DownloadRepository] Error fetching jobs by status:', error);
      throw error;
    }
  }

  /**
   * Obtener job por ID
   */
  async getJobById(jobId: string): Promise<DownloadJob | null> {
    try {
      const url = API_CONFIG.endpoints.downloads.getById.replace(':jobId', jobId);
      const response = await apiClient.get<any>(url);

      return DownloadJob.fromDTO(response);
    } catch (error) {
      console.error('[DownloadRepository] Error fetching job:', error);
      return null;
    }
  }

  /**
   * Actualizar progreso de un job (no implementado en backend)
   */
  async updateJobProgress(jobId: string, progress: number): Promise<void> {
    // El backend maneja el progreso internamente
    // Este método podría usarse para caché local
  }

  /**
   * Descargar archivo completado
   */
  async downloadFile(filename: string, destinationPath: string): Promise<void> {
    try {
      const url = API_CONFIG.endpoints.downloads.downloadFile.replace(
        ':filename',
        filename
      );

      const downloadUrl = `${API_CONFIG.baseURL}${url}`;

      const downloadResult = await FileSystem.downloadAsync(
        downloadUrl,
        destinationPath
      );

      if (downloadResult.status !== 200) {
        throw new Error('Download failed');
      }
    } catch (error) {
      console.error('[DownloadRepository] Error downloading file:', error);
      throw error;
    }
  }

  /**
   * Monitorear estado de un job (polling)
   */
  async pollJobStatus(jobId: string, interval: number = 2000): Promise<DownloadJob> {
    return new Promise((resolve, reject) => {
      const poll = async () => {
        try {
          const job = await this.getJobById(jobId);

          if (!job) {
            reject(new Error('Job not found'));
            return;
          }

          resolve(job);
        } catch (error) {
          reject(error);
        }
      };

      poll();
    });
  }
}
