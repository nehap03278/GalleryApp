import React, { useState } from 'react';
import { Alert, Pressable, StyleSheet, Text, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import * as MediaLibrary from 'expo-media-library/legacy';
import * as FileSystem from 'expo-file-system/legacy';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Button } from '../../components/Button';
import { buildFullImageUrl } from '../../api/picsumApi';
import { useGalleryStore } from '../../store/useGalleryStore';
import type { RootStackParamList } from '../../types/navigation';
import { colors, spacing } from '../../utils/theme';

type Props = NativeStackScreenProps<RootStackParamList, 'ImageDetail'>;

export default function ImageDetailScreen({ route }: Props) {
  const { image } = route.params;
  const [isDownloading, setIsDownloading] = useState(false);
  const isFavorite = useGalleryStore((s) => s.isFavorite(image.id));
  const toggleFavorite = useGalleryStore((s) => s.toggleFavorite);

  async function handleDownload() {
    setIsDownloading(true);
    try {
      const permission = await MediaLibrary.requestPermissionsAsync();
      if (!permission.granted) {
        Alert.alert(
          'Permission Required',
          'Please allow access to your photo library to save images.'
        );
        return;
      }

      const fileUri = `${FileSystem.cacheDirectory}picsum-${image.id}.jpg`;
      const downloadResult = await FileSystem.downloadAsync(buildFullImageUrl(image), fileUri);

      if (downloadResult.status !== 200) {
        Alert.alert('Download Failed', 'The image could not be downloaded. Please try again.');
        return;
      }

      const asset = await MediaLibrary.createAssetAsync(downloadResult.uri);
      await MediaLibrary.createAlbumAsync('GalleryApp', asset, false);

      Alert.alert('Success', 'Image saved to your gallery.');
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Please try again.';
      Alert.alert('Error', `Something went wrong while saving the image. ${message}`);
    } finally {
      setIsDownloading(false);
    }
  }

  return (
    <SafeAreaView style={styles.safeArea} edges={['bottom']}>
      <View style={styles.imageContainer}>
        <Image
          source={{ uri: buildFullImageUrl(image) }}
          style={styles.image}
          contentFit="contain"
          transition={200}
        />
      </View>
      <View style={styles.detailsContainer}>
        <View style={styles.headerRow}>
          <Text style={styles.author}>{image.author}</Text>
          <Pressable
            style={styles.favoriteButton}
            onPress={() => toggleFavorite(image)}
            hitSlop={10}
            accessibilityRole="button"
            accessibilityLabel={isFavorite ? 'Unfavorite image' : 'Favorite image'}
          >
            <Ionicons name={isFavorite ? 'heart' : 'heart-outline'} size={26} color={isFavorite ? colors.danger : colors.textMuted} />
          </Pressable>
        </View>
        <Text style={styles.meta}>Image ID: {image.id}</Text>
        <Text style={styles.meta}>
          Dimensions: {image.width} x {image.height}
        </Text>
        <Button
          title="Download to Gallery"
          onPress={handleDownload}
          loading={isDownloading}
          style={styles.downloadButton}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.text,
  },
  imageContainer: {
    flex: 1,
    backgroundColor: '#000000',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  detailsContainer: {
    backgroundColor: colors.surface,
    padding: spacing.lg,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  author: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.text,
    flex: 1,
  },
  favoriteButton: {
    padding: spacing.xs,
  },
  meta: {
    fontSize: 14,
    color: colors.textMuted,
    marginTop: spacing.xs,
  },
  downloadButton: {
    marginTop: spacing.md,
  },
});
