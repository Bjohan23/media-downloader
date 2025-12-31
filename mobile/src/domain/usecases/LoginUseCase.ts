import { AuthRepository } from '../repositories';
import { Result } from './CreateDownloadUseCase';

/**
 * Caso de uso: Login
 */
export class LoginUseCase {
  constructor(private readonly authRepository: AuthRepository) {}

  /**
   * Ejecutar el caso de uso
   */
  async execute(email: string, password: string): Promise<Result<{ token: string }>> {
    try {
      if (!email || !password) {
        return {
          success: false,
          error: 'Email and password are required',
        };
      }

      const authResponse = await this.authRepository.login({ email, password });

      // Guardar token
      await this.authRepository.saveToken(authResponse.token);

      return {
        success: true,
        data: {
          token: authResponse.token,
        },
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Login failed',
      };
    }
  }
}

/**
 * Caso de uso: Registro
 */
export class RegisterUseCase {
  constructor(private readonly authRepository: AuthRepository) {}

  /**
   * Ejecutar el caso de uso
   */
  async execute(
    email: string,
    password: string,
    name: string,
  ): Promise<Result<{ token: string }>> {
    try {
      if (!email || !password || !name) {
        return {
          success: false,
          error: 'All fields are required',
        };
      }

      if (password.length < 6) {
        return {
          success: false,
          error: 'Password must be at least 6 characters',
        };
      }

      const authResponse = await this.authRepository.register({
        email,
        password,
        name,
      });

      // Guardar token
      await this.authRepository.saveToken(authResponse.token);

      return {
        success: true,
        data: {
          token: authResponse.token,
        },
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Registration failed',
      };
    }
  }
}

/**
 * Caso de uso: Logout
 */
export class LogoutUseCase {
  constructor(private readonly authRepository: AuthRepository) {}

  /**
   * Ejecutar el caso de uso
   */
  async execute(): Promise<Result<void>> {
    try {
      await this.authRepository.logout();
      await this.authRepository.clearToken();

      return {
        success: true,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Logout failed',
      };
    }
  }
}

/**
 * Caso de uso: Obtener usuario actual
 */
export class GetCurrentUserUseCase {
  constructor(private readonly authRepository: AuthRepository) {}

  /**
   * Ejecutar el caso de uso
   */
  async execute(): Promise<Result<{ isAuthenticated: boolean; user: any }>> {
    try {
      const user = await this.authRepository.getCurrentUser();

      return {
        success: true,
        data: {
          isAuthenticated: !!user,
          user,
        },
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to get current user',
      };
    }
  }
}
