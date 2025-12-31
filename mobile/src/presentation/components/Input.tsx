import React, { useState } from 'react';
import {
  View,
  TextInput,
  Text,
  ViewStyle,
  TextStyle,
  TextInputProps,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../theme';

/**
 * Props del componente Input
 */
interface InputProps extends TextInputProps {
  label?: string;
  error?: string;
  icon?: keyof typeof Ionicons.glyphMap;
  containerStyle?: ViewStyle;
}

/**
 * Componente Input optimizado
 */
export const Input = React.memo<InputProps>(({
  label,
  error,
  icon,
  containerStyle,
  style,
  ...textInputProps
}) => {
  const { theme } = useTheme();
  const [isFocused, setIsFocused] = useState(false);

  const inputStyle: ViewStyle = {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borders.radius.lg,
    borderWidth: theme.borders.width.normal,
    borderColor: error 
      ? theme.colors.error 
      : isFocused 
        ? theme.colors.primary 
        : theme.colors.border,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.md,
    marginTop: theme.spacing.xs,
    minHeight: 52,
  };

  const textInputStyle: TextStyle = {
    flex: 1,
    color: theme.colors.textPrimary,
    fontSize: theme.typography.fontSize.base,
    padding: 0,
    marginLeft: icon ? theme.spacing.sm : 0,
  };

  return (
    <View style={containerStyle}>
      {label && (
        <Text
          style={{
            color: theme.colors.textPrimary,
            fontSize: theme.typography.fontSize.sm,
            fontWeight: '600',
            marginBottom: theme.spacing.xs,
          }}
        >
          {label}
        </Text>
      )}
      <View style={inputStyle}>
        {icon && (
          <Ionicons
            name={icon}
            size={20}
            color={isFocused ? theme.colors.primary : theme.colors.textSecondary}
          />
        )}
        <TextInput
          style={[textInputStyle, style]}
          placeholderTextColor={theme.colors.textSecondary}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          {...textInputProps}
        />
      </View>
      {error && (
        <Text
          style={{
            color: theme.colors.error,
            fontSize: theme.typography.fontSize.xs,
            marginTop: theme.spacing.xs,
          }}
        >
          {error}
        </Text>
      )}
    </View>
  );
});

Input.displayName = 'Input';
