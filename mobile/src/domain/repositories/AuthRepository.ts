import { User } from '../entities';

/**
 * Credenciales de login
 */
export interface LoginCredentials {
  email: string;
  password: string;
}

/**
 * Credenciales de registro
 */
export interface RegisterCredentials {
  email: string;
  password: string;
  name: string;
}

/**
 * Respuesta de autenticación
 */
export interface AuthResponse {
  user: User;
  token: string;
}

/**
 * Interfaz del repositorio de autenticación
 * Implementado en la capa de Data
 */
export interface AuthRepository {
  /**
   * Iniciar sesión
   */
  login(credentials: LoginCredentials): Promise<AuthResponse>;

  /**
   * Registrar nuevo usuario
   */
  register(credentials: RegisterCredentials): Promise<AuthResponse>;

  /**
   * Cerrar sesión
   */
  logout(): Promise<void>;

  /**
   * Obtener usuario actual
   */
  getCurrentUser(): Promise<User | null>;

  /**
   * Guardar token de autenticación
   */
  saveToken(token: string): Promise<void>;

  /**
   * Obtener token almacenado
   */
  getToken(): Promise<string | null>;

  /**
   * Limpiar token
   */
  clearToken(): Promise<void>;

  /**
   * Verificar si hay sesión activa
   */
  isAuthenticated(): Promise<boolean>;
}
