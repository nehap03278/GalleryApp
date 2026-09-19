import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { colors, spacing } from '../utils/theme';

interface RadioGroupProps<T extends string> {
  label: string;
  options: readonly T[];
  selectedValue: T | null;
  onChange: (value: T) => void;
  error?: string;
}

export function RadioGroup<T extends string>({ label, options, selectedValue, onChange, error }: RadioGroupProps<T>) {
  return (
    <View style={styles.container}>
      <Text style={styles.label}>{label}</Text>
      <View style={styles.row}>
        {options.map((option) => {
          const isSelected = selectedValue === option;
          return (
            <Pressable
              key={option}
              style={styles.optionRow}
              onPress={() => onChange(option)}
              accessibilityRole="radio"
              accessibilityState={{ selected: isSelected }}
            >
              <View style={[styles.circle, isSelected && styles.circleSelected]}>
                {isSelected ? <View style={styles.innerDot} /> : null}
              </View>
              <Text style={styles.optionText}>{option}</Text>
            </Pressable>
          );
        })}
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
  row: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.lg,
  },
  optionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: spacing.md,
  },
  circle: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.xs,
  },
  circleSelected: {
    borderColor: colors.primary,
  },
  innerDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: colors.primary,
  },
  optionText: {
    fontSize: 15,
    color: colors.text,
  },
  errorText: {
    color: colors.danger,
    fontSize: 13,
    marginTop: spacing.xs,
  },
});
