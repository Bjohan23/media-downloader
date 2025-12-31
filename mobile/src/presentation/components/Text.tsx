import React from 'react';
import { Text as RNText, TextStyle } from 'react-native';
import { useTheme } from '../theme';

/**
 * Props del componente Text
 */
export interface TextProps {
  children: React.ReactNode;
  variant?: 'xs' | 'sm' | 'base' | 'lg' | 'xl' | 'xl2' | 'xl3';
  color?: 'primary' | 'secondary' | 'textPrimary' | 'textSecondary' | 'error' | 'success' | 'warning';
  weight?: 'regular' | 'medium' | 'semibold' | 'bold';
  style?: TextStyle;
  numberOfLines?: number;
}

/**
 * Componente Text optimizado con tema
 */
export const Text = React.memo<TextProps>(({
  children,
  variant = 'base',
  color = 'textPrimary',
  weight = 'regular',
  style,
  numberOfLines,
}) => {
  const { theme } = useTheme();

  const getFontSize = (): number => {
    return theme.typography.fontSize[variant];
  };

  const getFontWeight = (): string => {
    const weights = {
      regular: '400',
      medium: '500',
      semibold: '600',
      bold: '700',
    };
    return weights[weight];
  };

  const getColor = (): string => {
    const colors = {
      primary: theme.colors.primary,
      secondary: theme.colors.secondary,
      textPrimary: theme.colors.textPrimary,
      textSecondary: theme.colors.textSecondary,
      error: theme.colors.error,
      success: theme.colors.success,
      warning: theme.colors.warning,
    };
    return colors[color];
  };

  return (
    <RNText
      style={[
        {
          fontSize: getFontSize(),
          fontWeight: getFontWeight() as any,
          color: getColor(),
        },
        style,
      ]}
      numberOfLines={numberOfLines}
    >
      {children}
    </RNText>
  );
});

Text.displayName = 'Text';
