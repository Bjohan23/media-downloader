/**
 * Utilidad de logging para debugging
 */
const LOG_PREFIX = '[MediaDownloader]';

export enum LogLevel {
  DEBUG = 'DEBUG',
  INFO = 'INFO',
  WARN = 'WARN',
  ERROR = 'ERROR',
}

class Logger {
  private isEnabled: boolean = __DEV__;

  /**
   * Log de nivel DEBUG
   */
  debug(message: string, ...args: any[]) {
    if (this.isEnabled) {
      console.log(`${LOG_PREFIX} [DEBUG] ${message}`, ...args);
    }
  }

  /**
   * Log de nivel INFO
   */
  info(message: string, ...args: any[]) {
    if (this.isEnabled) {
      console.info(`${LOG_PREFIX} [INFO] ${message}`, ...args);
    }
  }

  /**
   * Log de nivel WARN
   */
  warn(message: string, ...args: any[]) {
    if (this.isEnabled) {
      console.warn(`${LOG_PREFIX} [WARN] ${message}`, ...args);
    }
  }

  /**
   * Log de nivel ERROR
   */
  error(message: string, error?: any) {
    if (this.isEnabled) {
      console.error(`${LOG_PREFIX} [ERROR] ${message}`, error);
    }
  }

  /**
   * Log para requests de API
   */
  apiRequest(method: string, url: string, data?: any) {
    this.info(`API Request [${method}] ${url}`, data ? JSON.stringify(data, null, 2) : '');
  }

  /**
   * Log para responses de API
   */
  apiResponse(method: string, url: string, response?: any) {
    this.debug(`API Response [${method}] ${url}`, response ? JSON.stringify(response, null, 2) : '');
  }

  /**
   * Log para errores de API
   */
  apiError(method: string, url: string, error: any) {
    this.error(`API Error [${method}] ${url}`, error);
  }

  /**
   * Log para eventos de descarga
   */
  download(event: string, data?: any) {
    this.info(`Download [${event}]`, data);
  }
}

// Exportar instancia singleton
export const logger = new Logger();
