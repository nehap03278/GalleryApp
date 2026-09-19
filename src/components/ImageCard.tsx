import React, { memo } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import { buildThumbnailUrl } from '../api/picsumApi';
import type { PicsumImage } from '../types/gallery';
import { colors, radii, spacing } from '../utils/theme';

interface ImageCardProps {
  image: PicsumImage;
  isFavorite: boolean;
  onPress: (image: PicsumImage) => void;
  onToggleFavorite: (image: PicsumImage) => void;
}

function ImageCardComponent({ image, isFavorite, onPress, onToggleFavorite }: ImageCardProps) {
  return (
    <Pressable style={styles.card} onPress={() => onPress(image)} accessibilityRole="button">
      <Image
        source={{ uri: buildThumbnailUrl(image.id, 200) }}
        style={styles.thumbnail}
        contentFit="cover"
        transition={150}
      />
      <View style={styles.info}>
        <Text style={styles.author} numberOfLines={1}>
          {image.author}
        </Text>
        <Text style={styles.id}>ID: {image.id}</Text>
      </View>
      <Pressable
        style={styles.favoriteButton}
        onPress={() => onToggleFavorite(image)}
        hitSlop={10}
        accessibilityRole="button"
        accessibilityLabel={isFavorite ? 'Unfavorite image' : 'Favorite image'}
      >
        <Ionicons name={isFavorite ? 'heart' : 'heart-outline'} size={22} color={isFavorite ? colors.danger : colors.textMuted} />
      </Pressable>
    </Pressable>
  );
}

function areEqual(prev: ImageCardProps, next: ImageCardProps): boolean {
  return prev.image.id === next.image.id && prev.isFavorite === next.isFavorite;
}

export const ImageCard = memo(ImageCardComponent, areEqual);

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: radii.md,
    padding: spacing.sm,
    marginHorizontal: spacing.md,
    marginVertical: spacing.xs,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    elevation: 1,
  },
  thumbnail: {
    width: 64,
    height: 64,
    borderRadius: radii.sm,
    backgroundColor: colors.border,
  },
  info: {
    flex: 1,
    marginLeft: spacing.md,
  },
  author: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
  },
  id: {
    fontSize: 13,
    color: colors.textMuted,
    marginTop: 2,
  },
  favoriteButton: {
    padding: spacing.xs,
  },
});
