import {
  AuthRepository,
  LoginCredentials,
  RegisterCredentials,
  AuthResponse,
} from '@/domain/repositories';
import { User } from '@/domain/entities';
import { apiClient, SecureStoreService } from '../services';
import API_CONFIG from '../services/api.config';

/**
 * Implementación del repositorio de autenticación
 */
export class AuthRepositoryImpl implements AuthRepository {
  /**
   * Iniciar sesión
   */
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    try {
      const response = await apiClient.post<any>(
        API_CONFIG.endpoints.auth.login,
        credentials
      );

      return {
        user: User.fromDTO(response.user),
        token: response.access_token,
      };
    } catch (error) {
      console.error('[AuthRepository] Login error:', error);
      throw error;
    }
  }

  /**
   * Registrar nuevo usuario
   */
  async register(credentials: RegisterCredentials): Promise<AuthResponse> {
    try {
      const response = await apiClient.post<any>(
        API_CONFIG.endpoints.auth.register,
        credentials
      );

      return {
        user: User.fromDTO(response.user),
        token: response.access_token,
      };
    } catch (error) {
      console.error('[AuthRepository] Register error:', error);
      throw error;
    }
  }

  /**
   * Cerrar sesión
   */
  async logout(): Promise<void> {
    try {
      // Logout en el servidor (opcional)
      await apiClient.post(API_CONFIG.endpoints.auth.logout);
    } catch (error) {
      console.error('[AuthRepository] Logout error:', error);
      // No fallar si el endpoint no existe
    } finally {
      // Siempre limpiar token local
      await this.clearToken();
    }
  }

  /**
   * Obtener usuario actual
   */
  async getCurrentUser(): Promise<User | null> {
    try {
      const token = await this.getToken();

      if (!token) {
        return null;
      }

      const response = await apiClient.get<any>(API_CONFIG.endpoints.auth.me);

      return User.fromDTO(response);
    } catch (error) {
      console.error('[AuthRepository] Get current user error:', error);
      await this.clearToken();
      return null;
    }
  }

  /**
   * Guardar token
   */
  async saveToken(token: string): Promise<void> {
    return SecureStoreService.saveToken(token);
  }

  /**
   * Obtener token
   */
  async getToken(): Promise<string | null> {
    return SecureStoreService.getToken();
  }

  /**
   * Limpiar token
   */
  async clearToken(): Promise<void> {
    return SecureStoreService.deleteToken();
  }

  /**
   * Verificar si hay sesión activa
   */
  async isAuthenticated(): Promise<boolean> {
    const token = await this.getToken();
    return !!token;
  }
}
