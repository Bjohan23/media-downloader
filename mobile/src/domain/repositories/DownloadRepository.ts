import { DownloadJob, DownloadRequest } from '../entities';

/**
 * Interfaz del repositorio de descargas
 * Implementado en la capa de Data
 */
export interface DownloadRepository {
  /**
   * Crear un nuevo job de descarga
   */
  createDownload(request: DownloadRequest): Promise<DownloadJob>;

  /**
   * Obtener todos los jobs
   */
  getAllJobs(): Promise<DownloadJob[]>;

  /**
   * Obtener jobs por estado
   */
  getJobsByStatus(status: string): Promise<DownloadJob[]>;

  /**
   * Obtener un job por ID
   */
  getJobById(jobId: string): Promise<DownloadJob | null>;

  /**
   * Actualizar el progreso de un job
   */
  updateJobProgress(jobId: string, progress: number): Promise<void>;

  /**
   * Descargar archivo completado
   */
  downloadFile(filename: string, destinationPath: string): Promise<void>;

  /**
   * Monitorear estado de un job (polling)
   */
  pollJobStatus(jobId: string, interval?: number): Promise<DownloadJob>;
}
