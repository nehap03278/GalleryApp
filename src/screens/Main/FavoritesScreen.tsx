import React, { useCallback, useEffect, useMemo } from 'react';
import { FlatList, ListRenderItemInfo, StyleSheet, View } from 'react-native';
import type { CompositeScreenProps } from '@react-navigation/native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ImageCard } from '../../components/ImageCard';
import { SearchBar } from '../../components/SearchBar';
import { EmptyState } from '../../components/EmptyState';
import { useGalleryStore } from '../../store/useGalleryStore';
import type { PicsumImage } from '../../types/gallery';
import type { MainTabParamList, RootStackParamList } from '../../types/navigation';
import { colors, spacing } from '../../utils/theme';

type Props = CompositeScreenProps<
  BottomTabScreenProps<MainTabParamList, 'Favorites'>,
  NativeStackScreenProps<RootStackParamList>
>;

export default function FavoritesScreen({ navigation }: Props) {
  const favorites = useGalleryStore((s) => s.favorites);
  const favoritesSearchQuery = useGalleryStore((s) => s.favoritesSearchQuery);
  const setFavoritesSearchQuery = useGalleryStore((s) => s.setFavoritesSearchQuery);
  const loadFavorites = useGalleryStore((s) => s.loadFavorites);
  const removeFavorite = useGalleryStore((s) => s.removeFavorite);

  useEffect(() => {
    loadFavorites();
  }, [loadFavorites]);

  const filteredFavorites = useMemo(() => {
    const query = favoritesSearchQuery.trim().toLowerCase();
    if (!query) return favorites;
    return favorites.filter((image) => image.author.toLowerCase().includes(query));
  }, [favorites, favoritesSearchQuery]);

  const handleOpenDetail = useCallback(
    (image: PicsumImage) => {
      navigation.navigate('ImageDetail', { image });
    },
    [navigation]
  );

  const handleRemove = useCallback(
    (image: PicsumImage) => {
      removeFavorite(image.id);
    },
    [removeFavorite]
  );

  const renderItem = useCallback(
    ({ item }: ListRenderItemInfo<PicsumImage>) => (
      <ImageCard image={item} isFavorite onPress={handleOpenDetail} onToggleFavorite={handleRemove} />
    ),
    [handleOpenDetail, handleRemove]
  );

  const keyExtractor = useCallback((item: PicsumImage) => item.id, []);

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <View>
        <SearchBar
          value={favoritesSearchQuery}
          onChangeText={setFavoritesSearchQuery}
          placeholder="Search favorites by author..."
        />
      </View>
      <FlatList
        data={filteredFavorites}
        renderItem={renderItem}
        keyExtractor={keyExtractor}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          <EmptyState
            title="No favorites yet"
            subtitle={
              favoritesSearchQuery
                ? 'No favorites match your search.'
                : 'Tap the heart icon on an image to add it here.'
            }
          />
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },
  listContent: {
    paddingTop: spacing.sm,
    paddingBottom: spacing.lg,
    flexGrow: 1,
  },
});
