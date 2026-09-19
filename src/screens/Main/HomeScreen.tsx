import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { FlatList, ListRenderItemInfo, RefreshControl, StyleSheet, Text, View } from 'react-native';
import type { CompositeScreenProps } from '@react-navigation/native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ImageCard } from '../../components/ImageCard';
import { SearchBar } from '../../components/SearchBar';
import { FilterTabs } from '../../components/FilterTabs';
import { EmptyState } from '../../components/EmptyState';
import { LoadingSpinner } from '../../components/LoadingSpinner';
import { Button } from '../../components/Button';
import { useFetchImages } from '../../hooks/useFetchImages';
import { useDebounce } from '../../hooks/useDebounce';
import { useGalleryStore } from '../../store/useGalleryStore';
import type { PicsumImage } from '../../types/gallery';
import type { MainTabParamList, RootStackParamList } from '../../types/navigation';
import { colors, spacing } from '../../utils/theme';

type Props = CompositeScreenProps<
  BottomTabScreenProps<MainTabParamList, 'Home'>,
  NativeStackScreenProps<RootStackParamList>
>;

export default function HomeScreen({ navigation }: Props) {
  const { images, isLoading, isLoadingMore, isRefreshing, error, loadMore, refresh } = useFetchImages();
  const searchQuery = useGalleryStore((s) => s.searchQuery);
  const filter = useGalleryStore((s) => s.filter);
  const setSearchQuery = useGalleryStore((s) => s.setSearchQuery);
  const setFilter = useGalleryStore((s) => s.setFilter);
  const favorites = useGalleryStore((s) => s.favorites);
  const loadFavorites = useGalleryStore((s) => s.loadFavorites);
  const toggleFavorite = useGalleryStore((s) => s.toggleFavorite);

  const [inputValue, setInputValue] = useState(searchQuery);
  const debouncedQuery = useDebounce(inputValue, 350);

  useEffect(() => {
    loadFavorites();
  }, [loadFavorites]);

  useEffect(() => {
    setSearchQuery(debouncedQuery);
  }, [debouncedQuery, setSearchQuery]);

  const favoriteIds = useMemo(() => new Set(favorites.map((f) => f.id)), [favorites]);

  const filteredImages = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    return images.filter((image) => {
      const author = image.author.toLowerCase();
      if (query && !author.includes(query)) return false;
      if (filter === 'ALL') return true;
      const firstLetter = author.charAt(0);
      if (filter === 'A_M') return firstLetter >= 'a' && firstLetter <= 'm';
      return firstLetter >= 'n' && firstLetter <= 'z';
    });
  }, [images, searchQuery, filter]);

  const handleOpenDetail = useCallback(
    (image: PicsumImage) => {
      navigation.navigate('ImageDetail', { image });
    },
    [navigation]
  );

  const handleToggleFavorite = useCallback(
    (image: PicsumImage) => {
      toggleFavorite(image);
    },
    [toggleFavorite]
  );

  const renderItem = useCallback(
    ({ item }: ListRenderItemInfo<PicsumImage>) => (
      <ImageCard
        image={item}
        isFavorite={favoriteIds.has(item.id)}
        onPress={handleOpenDetail}
        onToggleFavorite={handleToggleFavorite}
      />
    ),
    [favoriteIds, handleOpenDetail, handleToggleFavorite]
  );

  const keyExtractor = useCallback((item: PicsumImage) => item.id, []);

  const listHeader = (
    <View>
      <SearchBar value={inputValue} onChangeText={setInputValue} />
      <FilterTabs selected={filter} onChange={setFilter} />
    </View>
  );

  if (isLoading && images.length === 0) {
    return (
      <SafeAreaView style={styles.safeArea} edges={['top']}>
        {listHeader}
        <LoadingSpinner message="Loading images..." />
      </SafeAreaView>
    );
  }

  if (error && images.length === 0) {
    return (
      <SafeAreaView style={styles.safeArea} edges={['top']}>
        {listHeader}
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
          <Button title="Retry" onPress={refresh} style={styles.retryButton} />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <FlatList
        data={filteredImages}
        renderItem={renderItem}
        keyExtractor={keyExtractor}
        ListHeaderComponent={listHeader}
        contentContainerStyle={styles.listContent}
        refreshControl={<RefreshControl refreshing={isRefreshing} onRefresh={refresh} colors={[colors.primary]} />}
        onEndReached={loadMore}
        onEndReachedThreshold={0.5}
        ListEmptyComponent={
          <EmptyState
            title="No images found"
            subtitle={searchQuery ? 'Try a different search term or filter.' : 'Pull down to refresh.'}
          />
        }
        ListFooterComponent={
          isLoadingMore ? <LoadingSpinner message="Loading more..." fullScreen={false} /> : null
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
    paddingBottom: spacing.lg,
    flexGrow: 1,
  },
  errorContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.xl,
  },
  errorText: {
    color: colors.danger,
    fontSize: 15,
    textAlign: 'center',
    marginBottom: spacing.md,
  },
  retryButton: {
    minWidth: 140,
  },
});
