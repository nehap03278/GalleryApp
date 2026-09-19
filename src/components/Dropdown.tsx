import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { colors, radii, spacing } from '../utils/theme';

interface DropdownOption {
  label: string;
  value: string;
}

interface DropdownProps {
  label: string;
  selectedValue: string;
  onValueChange: (value: string) => void;
  options: DropdownOption[];
  placeholder?: string;
  error?: string;
}

export function Dropdown({ label, selectedValue, onValueChange, options, placeholder = 'Select...', error }: DropdownProps) {
  return (
    <View style={styles.container}>
      <Text style={styles.label}>{label}</Text>
      <View style={[styles.pickerWrapper, error && styles.pickerError]}>
        <Picker
          selectedValue={selectedValue}
          onValueChange={(value) => onValueChange(String(value))}
          style={styles.picker}
          dropdownIconColor={colors.text}
        >
          <Picker.Item label={placeholder} value="" color={colors.textMuted} />
          {options.map((option) => (
            <Picker.Item key={option.value} label={option.label} value={option.value} color={colors.text} />
          ))}
        </Picker>
      </View>
      {error ? <Text style={styles.errorText}>{error}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: spacing.md,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
    marginBottom: spacing.xs,
  },
  pickerWrapper: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.md,
    backgroundColor: colors.surface,
    overflow: 'hidden',
  },
  pickerError: {
    borderColor: colors.danger,
  },
  picker: {
    color: colors.text,
    backgroundColor: colors.surface,
  },
  errorText: {
    color: colors.danger,
    fontSize: 13,
    marginTop: spacing.xs,
  },
});
