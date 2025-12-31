import axios, { AxiosInstance, AxiosError, AxiosRequestConfig } from 'axios';
import API_CONFIG from './api.config';

/**
 * Cliente HTTP con Axios
 */
class ApiClient {
  private client: AxiosInstance;

  constructor() {
    this.client = axios.create({
      baseURL: API_CONFIG.baseURL,
      timeout: API_CONFIG.timeout,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    this.setupInterceptors();
  }

  /**
   * Configurar interceptores
   */
  private setupInterceptors(): void {
    // Interceptor de request
    this.client.interceptors.request.use(
      async (config) => {
        // Agregar token si existe
        const token = await this.getToken();
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => {
        return Promise.reject(error);
      }
    );

    // Interceptor de response
    this.client.interceptors.response.use(
      (response) => response,
      (error) => {
        return this.handleError(error);
      }
    );
  }

  /**
   * Manejar errores de API
   */
  private handleError(error: AxiosError): Promise<never> {
    if (error.response) {
      // El servidor respondió con un código de error
      const status = error.response.status;
      const message = this.getErrorMessage(status);

      console.error('[API Error]', status, message);

      return Promise.reject(new Error(message));
    } else if (error.request) {
      // La petición se hizo pero no se recibió respuesta
      console.error('[Network Error]', 'No response received');
      return Promise.reject(new Error('Network error. Please check your connection.'));
    } else {
      // Error al configurar la petición
      console.error('[Request Error]', error.message);
      return Promise.reject(error);
    }
  }

  /**
   * Obtener mensaje de error según código de estado
   */
  private getErrorMessage(status: number): string {
    switch (status) {
      case 400:
        return 'Invalid request. Please check your data.';
      case 401:
        return 'Unauthorized. Please login again.';
      case 403:
        return 'Access denied.';
      case 404:
        return 'Resource not found.';
      case 500:
        return 'Server error. Please try again later.';
      default:
        return 'An error occurred. Please try again.';
    }
  }

  /**
   * Obtener token almacenado (implementación en AuthRepository)
   */
  private async getToken(): Promise<string | null> {
    // Importar aquí para evitar dependencias circulares
    const { SecureStoreService } = require('../services/secureStore.service');
    return SecureStoreService.getToken();
  }

  /**
   * GET request
   */
  async get<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.client.get<T>(url, config);
    return response.data;
  }

  /**
   * POST request
   */
  async post<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.client.post<T>(url, data, config);
    return response.data;
  }

  /**
   * PUT request
   */
  async put<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.client.put<T>(url, data, config);
    return response.data;
  }

  /**
   * DELETE request
   */
  async delete<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.client.delete<T>(url, config);
    return response.data;
  }

  /**
   * Download file (como blob/arraybuffer)
   */
  async downloadFile(url: string, onProgress?: (progress: number) => void): Promise<any> {
    const response = await this.client.get(url, {
      responseType: 'arraybuffer',
      onDownloadProgress: (progressEvent) => {
        if (onProgress && progressEvent.total) {
          const progress = Math.round(
            (progressEvent.loaded * 100) / progressEvent.total
          );
          onProgress(progress);
        }
      },
    });
    return response.data;
  }

  /**
   * Obtener instancia de Axios directamente
   */
  getInstance(): AxiosInstance {
    return this.client;
  }
}

// Singleton
export const apiClient = new ApiClient();
