import React from 'react';
import {
  View,
  TouchableOpacity,
  Text,
  Modal,
  FlatList,
  ViewStyle,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../theme';

/**
 * Opción del selector
 */
export interface SelectOption {
  label: string;
  value: string;
}

/**
 * Props del componente SelectPicker
 */
interface SelectPickerProps {
  label?: string;
  options: SelectOption[];
  value: string;
  onSelect: (value: string) => void;
  placeholder?: string;
  containerStyle?: ViewStyle;
  error?: string;
}

/**
 * Componente SelectPicker optimizado
 */
export const SelectPicker = React.memo<SelectPickerProps>(({
  label,
  options,
  value,
  onSelect,
  placeholder = 'Selecciona una opción',
  containerStyle,
  error,
}) => {
  const { theme } = useTheme();
  const [visible, setVisible] = React.useState(false);

  const selectedOption = options.find((opt) => opt.value === value);

  const renderItem = ({ item }: { item: SelectOption }) => (
    <TouchableOpacity
      style={{
        padding: theme.spacing.md,
        borderBottomWidth: theme.borders.width.thin,
        borderBottomColor: theme.colors.border,
      }}
      onPress={() => {
        onSelect(item.value);
        setVisible(false);
      }}
    >
      <Text
        style={{
          color: item.value === value ? theme.colors.primary : theme.colors.textPrimary,
          fontSize: theme.typography.fontSize.base,
        }}
      >
        {item.label}
      </Text>
      {item.value === value && (
        <Ionicons
          name="checkmark"
          size={theme.typography.fontSize.lg}
          color={theme.colors.primary}
          style={{ position: 'absolute', right: theme.spacing.md }}
        />
      )}
    </TouchableOpacity>
  );

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
      <TouchableOpacity
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          backgroundColor: theme.colors.surface,
          borderRadius: theme.borders.radius.lg,
          borderWidth: theme.borders.width.normal,
          borderColor: error ? theme.colors.error : theme.colors.border,
          paddingHorizontal: theme.spacing.md,
          paddingVertical: theme.spacing.md,
          marginTop: theme.spacing.xs,
          minHeight: 52,
        }}
        onPress={() => setVisible(true)}
      >
        <Text
          style={{
            flex: 1,
            color: selectedOption ? theme.colors.textPrimary : theme.colors.textSecondary,
            fontSize: theme.typography.fontSize.base,
          }}
        >
          {selectedOption ? selectedOption.label : placeholder}
        </Text>
        <Ionicons
          name="chevron-down"
          size={theme.typography.fontSize.lg}
          color={theme.colors.textSecondary}
        />
      </TouchableOpacity>
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

      <Modal
        visible={visible}
        transparent
        animationType="slide"
        onRequestClose={() => setVisible(false)}
      >
        <TouchableOpacity
          style={{
            flex: 1,
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            justifyContent: 'flex-end',
          }}
          activeOpacity={1}
          onPress={() => setVisible(false)}
        >
          <View
            style={{
              backgroundColor: theme.colors.surface,
              borderTopLeftRadius: theme.borders.radius.xl,
              borderTopRightRadius: theme.borders.radius.xl,
              paddingTop: theme.spacing.lg,
              maxHeight: '50%',
            }}
          >
            <View style={{ paddingHorizontal: theme.spacing.md }}>
              <Text
                style={{
                  fontSize: theme.typography.fontSize.lg,
                  fontWeight: '600',
                  color: theme.colors.textPrimary,
                  marginBottom: theme.spacing.md,
                }}
              >
                {label || 'Seleccionar Opción'}
              </Text>
            </View>
            <FlatList
              data={options}
              renderItem={renderItem}
              keyExtractor={(item) => item.value}
            />
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
});

SelectPicker.displayName = 'SelectPicker';
