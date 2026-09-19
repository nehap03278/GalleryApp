import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import type { AuthorFilter } from '../types/gallery';
import { colors, radii, spacing } from '../utils/theme';

const FILTERS: { label: string; value: AuthorFilter }[] = [
  { label: 'All Images', value: 'ALL' },
  { label: 'Author A-M', value: 'A_M' },
  { label: 'Author N-Z', value: 'N_Z' },
];

interface FilterTabsProps {
  selected: AuthorFilter;
  onChange: (filter: AuthorFilter) => void;
}

export function FilterTabs({ selected, onChange }: FilterTabsProps) {
  return (
    <View style={styles.container}>
      {FILTERS.map((filter) => {
        const isActive = selected === filter.value;
        return (
          <Pressable
            key={filter.value}
            style={[styles.tab, isActive && styles.tabActive]}
            onPress={() => onChange(filter.value)}
          >
            <Text style={[styles.tabText, isActive && styles.tabTextActive]}>{filter.label}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    marginHorizontal: spacing.md,
    marginTop: spacing.sm,
    gap: spacing.xs,
  },
  tab: {
    flex: 1,
    paddingVertical: spacing.xs + 2,
    borderRadius: radii.full,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
  },
  tabActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  tabText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.textMuted,
  },
  tabTextActive: {
    color: colors.white,
  },
});
