import { ColorPalette, Theme, Spacing, Borders, Shadows, Animations } from './theme.types';

/**
 * Paleta Ocean Breeze (Light Theme)
 */
export const oceanBreezePalette: ColorPalette = {
  primary: '#0EA5E9',
  secondary: '#0284C7',
  background: '#FFFFFF',
  backgroundSecondary: '#F0F9FF',
  surface: '#FFFFFF',
  surfaceVariant: '#F0F9FF',
  textPrimary: '#0C4A6E',
  textSecondary: '#64748B',
  border: '#BAE6FD',
  error: '#F43F5E',
  success: '#06B6D4',
  warning: '#F59E0B',
  info: '#0EA5E9',
};

/**
 * Paleta Dark Mode Native (Dark Theme)
 */
export const darkModePalette: ColorPalette = {
  primary: '#0A84FF',
  secondary: '#5E5CE6',
  background: '#000000',
  backgroundSecondary: '#1C1C1E',
  surface: '#2C2C2E',
  surfaceVariant: '#1C1C1E',
  textPrimary: '#FFFFFF',
  textSecondary: '#8E8E93',
  border: '#38383A',
  error: '#FF453A',
  success: '#32D74B',
  warning: '#FFD60A',
  info: '#0A84FF',
};

/**
 * Tipografía base
 */
const baseTypography = {
  fontFamily: {
    regular: 'System',
    medium: 'System',
    semibold: 'System',
    bold: 'System',
  },
  fontSize: {
    xs: 12,
    sm: 14,
    base: 16,
    lg: 18,
    xl: 20,
    xl2: 24,
    xl3: 30,
  },
  lineHeight: {
    tight: 1.25,
    normal: 1.5,
    relaxed: 1.75,
  },
};

/**
 * Espaciado base (escala de 4px)
 */
const baseSpacing: Spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xl2: 48,
  xl3: 64,
};

/**
 * Bordes base
 */
const baseBorders: Borders = {
  radius: {
    sm: 4,
    md: 8,
    lg: 12,
    xl: 16,
    full: 9999,
  },
  width: {
    thin: 1,
    normal: 2,
    thick: 3,
  },
};

/**
 * Sombras Light Theme
 */
const lightShadows: Shadows = {
  none: {
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0,
    shadowRadius: 0,
    elevation: 0,
  },
  sm: {
    shadowColor: '#0C4A6E',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  md: {
    shadowColor: '#0C4A6E',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 4,
  },
  lg: {
    shadowColor: '#0C4A6E',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 8,
  },
  xl: {
    shadowColor: '#0C4A6E',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 16,
    elevation: 12,
  },
};

/**
 * Sombras Dark Theme
 */
const darkShadows: Shadows = {
  none: {
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0,
    shadowRadius: 0,
    elevation: 0,
  },
  sm: {
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.3,
    shadowRadius: 2,
    elevation: 2,
  },
  md: {
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.4,
    shadowRadius: 4,
    elevation: 4,
  },
  lg: {
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.5,
    shadowRadius: 8,
    elevation: 8,
  },
  xl: {
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.6,
    shadowRadius: 16,
    elevation: 12,
  },
};

/**
 * Animaciones base (compartidas)
 */
const baseAnimations: Animations = {
  timing: {
    fast: 200,
    normal: 300,
    slow: 500,
  },
  easing: {
    easeInOut: 'ease-in-out',
    easeOut: 'ease-out',
    easeIn: 'ease-in',
    linear: 'linear',
  },
};

/**
 * Tema Light completo
 */
export const lightTheme: Theme = {
  mode: 'light',
  colors: oceanBreezePalette,
  typography: baseTypography,
  spacing: baseSpacing,
  borders: baseBorders,
  shadows: lightShadows,
  animations: baseAnimations,
  isDark: false,
};

/**
 * Tema Dark completo
 */
export const darkTheme: Theme = {
  mode: 'dark',
  colors: darkModePalette,
  typography: baseTypography,
  spacing: baseSpacing,
  borders: baseBorders,
  shadows: darkShadows,
  animations: baseAnimations,
  isDark: true,
};
