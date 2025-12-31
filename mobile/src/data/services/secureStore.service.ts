import * as SecureStore from 'expo-secure-store';

const TOKEN_KEY = 'auth_token';

/**
 * Servicio para almacenamiento seguro
 */
export class SecureStoreService {
  /**
   * Guardar token de autenticación
   */
  static async saveToken(token: string): Promise<void> {
    try {
      await SecureStore.setItemAsync(TOKEN_KEY, token);
    } catch (error) {
      console.error('[SecureStore] Error saving token:', error);
      throw new Error('Failed to save token');
    }
  }

  /**
   * Obtener token de autenticación
   */
  static async getToken(): Promise<string | null> {
    try {
      return await SecureStore.getItemAsync(TOKEN_KEY);
    } catch (error) {
      console.error('[SecureStore] Error getting token:', error);
      return null;
    }
  }

  /**
   * Eliminar token de autenticación
   */
  static async deleteToken(): Promise<void> {
    try {
      await SecureStore.deleteItemAsync(TOKEN_KEY);
    } catch (error) {
      console.error('[SecureStore] Error deleting token:', error);
      throw new Error('Failed to delete token');
    }
  }

  /**
   * Limpiar todos los datos
   */
  static async clear(): Promise<void> {
    try {
      await SecureStore.deleteItemAsync(TOKEN_KEY);
    } catch (error) {
      console.error('[SecureStore] Error clearing data:', error);
    }
  }
}
