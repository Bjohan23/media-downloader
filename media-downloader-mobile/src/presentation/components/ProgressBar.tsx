import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { useTheme } from '../theme';

/**
 * Props del componente ProgressBar
 */
interface ProgressBarProps {
  progress: number; // 0-100
  height?: number;
  style?: ViewStyle;
  color?: string;
}

/**
 * Componente ProgressBar optimizado
 */
export const ProgressBar = React.memo<ProgressBarProps>(({
  progress,
  height = 6,
  style,
  color,
}) => {
  const { theme } = useTheme();

  const clampedProgress = Math.min(100, Math.max(0, progress));

  return (
    <View
      style={[
        {
          height,
          backgroundColor: theme.colors.border,
          borderRadius: height / 2,
          overflow: 'hidden',
        },
        style,
      ]}
    >
      <View
        style={{
          height: '100%',
          width: `${clampedProgress}%`,
          backgroundColor: color || theme.colors.primary,
          borderRadius: height / 2,
        }}
      />
    </View>
  );
});

ProgressBar.displayName = 'ProgressBar';
