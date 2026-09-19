import { create } from 'zustand';
import type { AuthorFilter, PicsumImage } from '../types/gallery';
import { getFavorites, saveFavorites } from '../utils/storage';

interface GalleryState {
  favorites: PicsumImage[];
  favoritesLoaded: boolean;
  searchQuery: string;
  filter: AuthorFilter;
  favoritesSearchQuery: string;
  loadFavorites: () => Promise<void>;
  toggleFavorite: (image: PicsumImage) => Promise<void>;
  isFavorite: (id: string) => boolean;
  removeFavorite: (id: string) => Promise<void>;
  setSearchQuery: (query: string) => void;
  setFilter: (filter: AuthorFilter) => void;
  setFavoritesSearchQuery: (query: string) => void;
}

export const useGalleryStore = create<GalleryState>((set, get) => ({
  favorites: [],
  favoritesLoaded: false,
  searchQuery: '',
  filter: 'ALL',
  favoritesSearchQuery: '',

  loadFavorites: async () => {
    if (get().favoritesLoaded) return;
    const favorites = await getFavorites();
    set({ favorites, favoritesLoaded: true });
  },

  toggleFavorite: async (image) => {
    const { favorites } = get();
    const exists = favorites.some((f) => f.id === image.id);
    const updated = exists ? favorites.filter((f) => f.id !== image.id) : [...favorites, image];
    set({ favorites: updated });
    await saveFavorites(updated);
  },

  removeFavorite: async (id) => {
    const updated = get().favorites.filter((f) => f.id !== id);
    set({ favorites: updated });
    await saveFavorites(updated);
  },

  isFavorite: (id) => get().favorites.some((f) => f.id === id),

  setSearchQuery: (query) => set({ searchQuery: query }),
  setFilter: (filter) => set({ filter }),
  setFavoritesSearchQuery: (query) => set({ favoritesSearchQuery: query }),
}));
