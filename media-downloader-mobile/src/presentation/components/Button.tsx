import React from 'react';
import {
  TouchableOpacity,
  Text,
  ViewStyle,
  TextStyle,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../theme';

/**
 * Tipos de botón
 */
type ButtonType = 'primary' | 'secondary' | 'outline' | 'ghost';

/**
 * Tamaños de botón
 */
type ButtonSize = 'small' | 'medium' | 'large';

/**
 * Props del componente Button
 */
interface ButtonProps {
  title: string;
  onPress: () => void;
  type?: ButtonType;
  size?: ButtonSize;
  disabled?: boolean;
  loading?: boolean;
  icon?: keyof typeof Ionicons.glyphMap;
  style?: ViewStyle;
  textStyle?: TextStyle;
}

/**
 * Componente Button optimizado con React.memo
 */
export const Button = React.memo<ButtonProps>(({
  title,
  onPress,
  type = 'primary',
  size = 'medium',
  disabled = false,
  loading = false,
  icon,
  style,
  textStyle,
}) => {
  const { theme } = useTheme();

  const getButtonStyle = (): ViewStyle => {
    const baseStyle: ViewStyle = {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      borderRadius: theme.borders.radius.lg,
      borderWidth: theme.borders.width.normal,
    };

    // Size
    const sizeStyles: Record<ButtonSize, ViewStyle> = {
      small: {
        paddingVertical: theme.spacing.sm,
        paddingHorizontal: theme.spacing.md,
        minHeight: 36,
      },
      medium: {
        paddingVertical: theme.spacing.md,
        paddingHorizontal: theme.spacing.lg,
        minHeight: 48,
      },
      large: {
        paddingVertical: theme.spacing.lg,
        paddingHorizontal: theme.spacing.xl,
        minHeight: 56,
      },
    };

    // Type
    const typeStyles: Record<ButtonType, ViewStyle> = {
      primary: {
        backgroundColor: disabled
          ? theme.colors.border
          : theme.colors.primary,
        borderColor: 'transparent',
        ...(!disabled && theme.shadows.md),
      },
      secondary: {
        backgroundColor: disabled
          ? theme.colors.border
          : theme.colors.secondary,
        borderColor: 'transparent',
        ...(!disabled && theme.shadows.sm),
      },
      outline: {
        backgroundColor: 'transparent',
        borderColor: disabled ? theme.colors.border : theme.colors.primary,
      },
      ghost: {
        backgroundColor: 'transparent',
        borderColor: 'transparent',
      },
    };

    return {
      ...baseStyle,
      ...sizeStyles[size],
      ...typeStyles[type],
    };
  };

  const getTextStyle = (): TextStyle => {
    const base: TextStyle = {
      fontWeight: '600',
      fontSize: theme.typography.fontSize.base,
    };

    const typeStyles: Record<ButtonType, TextStyle> = {
      primary: {
        color: disabled ? theme.colors.textSecondary : '#FFFFFF',
      },
      secondary: {
        color: disabled ? theme.colors.textSecondary : '#FFFFFF',
      },
      outline: {
        color: disabled ? theme.colors.textSecondary : theme.colors.primary,
      },
      ghost: {
        color: disabled ? theme.colors.textSecondary : theme.colors.primary,
      },
    };

    return { ...base, ...typeStyles[type] };
  };

  const buttonStyle = getButtonStyle();
  const computedTextStyle = getTextStyle();

  return (
    <TouchableOpacity
      style={[buttonStyle, style]}
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.7}
    >
      {loading ? (
        <ActivityIndicator
          color={type === 'outline' || type === 'ghost' ? theme.colors.primary : '#FFFFFF'}
          size="small"
        />
      ) : (
        <>
          {icon && (
            <Ionicons
              name={icon}
              size={theme.typography.fontSize.lg}
              color={computedTextStyle.color as string}
              style={{ marginRight: theme.spacing.sm }}
            />
          )}
          <Text style={[computedTextStyle, textStyle]}>{title}</Text>
        </>
      )}
    </TouchableOpacity>
  );
});

Button.displayName = 'Button';
