/**
 * Tipo de tema soportado por la aplicación
 */
export type ThemeMode = 'light' | 'dark' | 'system';

/**
 * Paleta de colores base
 */
export interface ColorPalette {
  primary: string;
  secondary: string;
  background: string;
  backgroundSecondary: string;
  surface: string;
  surfaceVariant: string;
  textPrimary: string;
  textSecondary: string;
  border: string;
  error: string;
  success: string;
  warning: string;
  info: string;
}

/**
 * Tipografía
 */
export interface Typography {
  fontFamily: {
    regular: string;
    medium: string;
    semibold: string;
    bold: string;
  };
  fontSize: {
    xs: number;
    sm: number;
    base: number;
    lg: number;
    xl: number;
    xl2: number;
    xl3: number;
  };
  lineHeight: {
    tight: number;
    normal: number;
    relaxed: number;
  };
}

/**
 * Espaciado
 */
export interface Spacing {
  xs: number;
  sm: number;
  md: number;
  lg: number;
  xl: number;
  xl2: number;
  xl3: number;
}

/**
 * Bordes
 */
export interface Borders {
  radius: {
    sm: number;
    md: number;
    lg: number;
    xl: number;
    full: number;
  };
  width: {
    thin: number;
    normal: number;
    thick: number;
  };
}

/**
 * Sombras y elevación
 */
export interface Shadows {
  none: {
    shadowColor: string;
    shadowOffset: { width: number; height: number };
    shadowOpacity: number;
    shadowRadius: number;
    elevation: number;
  };
  sm: {
    shadowColor: string;
    shadowOffset: { width: number; height: number };
    shadowOpacity: number;
    shadowRadius: number;
    elevation: number;
  };
  md: {
    shadowColor: string;
    shadowOffset: { width: number; height: number };
    shadowOpacity: number;
    shadowRadius: number;
    elevation: number;
  };
  lg: {
    shadowColor: string;
    shadowOffset: { width: number; height: number };
    shadowOpacity: number;
    shadowRadius: number;
    elevation: number;
  };
  xl: {
    shadowColor: string;
    shadowOffset: { width: number; height: number };
    shadowOpacity: number;
    shadowRadius: number;
    elevation: number;
  };
}

/**
 * Animaciones y transiciones
 */
export interface Animations {
  timing: {
    fast: number;
    normal: number;
    slow: number;
  };
  easing: {
    easeInOut: string;
    easeOut: string;
    easeIn: string;
    linear: string;
  };
}

/**
 * Tema completo de la aplicación
 */
export interface Theme {
  mode: 'light' | 'dark';
  colors: ColorPalette;
  typography: Typography;
  spacing: Spacing;
  borders: Borders;
  shadows: Shadows;
  animations: Animations;
  isDark: boolean;
}

/**
 * Configuración del ThemeProvider
 */
export interface ThemeProviderProps {
  children: React.ReactNode;
  initialTheme?: ThemeMode;
}
