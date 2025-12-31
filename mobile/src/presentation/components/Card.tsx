import React from 'react';
import {
  View,
  ViewStyle,
} from 'react-native';
import { useTheme } from '../theme';

/**
 * Props del componente Card
 */
interface CardProps {
  children: React.ReactNode;
  style?: ViewStyle;
  variant?: 'elevated' | 'outlined' | 'flat';
}

/**
 * Componente Card optimizado
 */
export const Card = React.memo<CardProps>(({
  children,
  style,
  variant = 'elevated',
}) => {
  const { theme } = useTheme();

  const getCardStyle = (): ViewStyle => {
    const base: ViewStyle = {
      borderRadius: theme.borders.radius.xl,
      padding: theme.spacing.lg,
      backgroundColor: theme.colors.surface,
    };

    const variantStyles: Record<typeof variant, ViewStyle> = {
      elevated: {
        ...theme.shadows.md,
      },
      outlined: {
        borderWidth: theme.borders.width.normal,
        borderColor: theme.colors.border,
      },
      flat: {},
    };

    return { ...base, ...variantStyles[variant] };
  };

  return <View style={[getCardStyle(), style]}>{children}</View>;
});

Card.displayName = 'Card';
