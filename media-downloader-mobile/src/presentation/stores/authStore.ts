import { create } from 'zustand';
import { User } from '@/domain/entities';

/**
 * Estado de autenticación
 */
interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

/**
 * Acciones de autenticación
 */
interface AuthActions {
  setUser: (user: User | null) => void;
  setToken: (token: string | null) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  login: (user: User, token: string) => void;
  logout: () => void;
  clearError: () => void;
}

/**
 * Store de autenticación
 */
export const useAuthStore = create<AuthState & AuthActions>((set) => ({
  // Estado inicial
  user: null,
  token: null,
  isAuthenticated: false,
  isLoading: false,
  error: null,

  // Acciones
  setUser: (user) =>
    set((state) => ({
      ...state,
      user,
      isAuthenticated: !!user,
    })),

  setToken: (token) =>
    set((state) => ({
      ...state,
      token,
    })),

  setLoading: (isLoading) =>
    set((state) => ({
      ...state,
      isLoading,
    })),

  setError: (error) =>
    set((state) => ({
      ...state,
      error,
    })),

  login: (user, token) =>
    set((state) => ({
      ...state,
      user,
      token,
      isAuthenticated: true,
      error: null,
    })),

  logout: () =>
    set({
      user: null,
      token: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,
    }),

  clearError: () =>
    set((state) => ({
      ...state,
      error: null,
    })),
}));
