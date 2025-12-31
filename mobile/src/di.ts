/**
 * Dependency Injection Container
 *
 * Proporciona instancias únicas de repositorios y casos de uso
 */

import { DownloadRepositoryImpl, AuthRepositoryImpl } from './data/repositories';
import {
  CreateDownloadUseCase,
  GetAllDownloadsUseCase,
  MonitorJobUseCase,
  DownloadFileUseCase,
  LoginUseCase,
  RegisterUseCase,
  LogoutUseCase,
  GetCurrentUserUseCase,
} from './domain/usecases';

// ============ REPOSITORIOS ============

const downloadRepository = new DownloadRepositoryImpl();
const authRepository = new AuthRepositoryImpl();

// ============ USE CASES - DESCARGAS ============

export const createDownloadUseCase = new CreateDownloadUseCase(downloadRepository);
export const getAllDownloadsUseCase = new GetAllDownloadsUseCase(downloadRepository);
export const monitorJobUseCase = new MonitorJobUseCase(downloadRepository);
export const downloadFileUseCase = new DownloadFileUseCase(downloadRepository);

// ============ USE CASES - AUTH ============

export const loginUseCase = new LoginUseCase(authRepository);
export const registerUseCase = new RegisterUseCase(authRepository);
export const logoutUseCase = new LogoutUseCase(authRepository);
export const getCurrentUserUseCase = new GetCurrentUserUseCase(authRepository);

// ============ EXPORTAR PARA FACILITAR IMPORTS ============

export const repositories = {
  download: downloadRepository,
  auth: authRepository,
};

export const useCases = {
  downloads: {
    create: createDownloadUseCase,
    getAll: getAllDownloadsUseCase,
    monitor: monitorJobUseCase,
    downloadFile: downloadFileUseCase,
  },
  auth: {
    login: loginUseCase,
    register: registerUseCase,
    logout: logoutUseCase,
    getCurrentUser: getCurrentUserUseCase,
  },
};
