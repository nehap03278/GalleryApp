import { useCallback, useEffect, useRef, useState } from 'react';
import { fetchImages, PicsumApiError } from '../api/picsumApi';
import type { PicsumImage } from '../types/gallery';

const PAGE_LIMIT = 20;

interface UseFetchImagesResult {
  images: PicsumImage[];
  isLoading: boolean;
  isLoadingMore: boolean;
  isRefreshing: boolean;
  error: string | null;
  hasMore: boolean;
  loadMore: () => void;
  refresh: () => void;
}

export function useFetchImages(): UseFetchImagesResult {
  const [images, setImages] = useState<PicsumImage[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(true);

  const pageRef = useRef(1);
  const isFetchingRef = useRef(false);
  const mountedRef = useRef(true);

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
    };
  }, []);

  const runFetch = useCallback(async (page: number, mode: 'initial' | 'more' | 'refresh') => {
    if (isFetchingRef.current) return;
    isFetchingRef.current = true;

    if (mode === 'initial') setIsLoading(true);
    if (mode === 'more') setIsLoadingMore(true);
    if (mode === 'refresh') setIsRefreshing(true);
    setError(null);

    try {
      const results = await fetchImages(page, PAGE_LIMIT);
      if (!mountedRef.current) return;

      setImages((prev) => {
        if (mode === 'refresh' || mode === 'initial') return results;
        const existingIds = new Set(prev.map((img) => img.id));
        const merged = [...prev, ...results.filter((img) => !existingIds.has(img.id))];
        return merged;
      });
      setHasMore(results.length === PAGE_LIMIT);
      pageRef.current = page;
    } catch (err) {
      if (!mountedRef.current) return;
      const message = err instanceof PicsumApiError ? err.message : 'Something went wrong while loading images.';
      setError(message);
    } finally {
      if (mountedRef.current) {
        setIsLoading(false);
        setIsLoadingMore(false);
        setIsRefreshing(false);
      }
      isFetchingRef.current = false;
    }
  }, []);

  useEffect(() => {
    Promise.resolve().then(() => runFetch(1, 'initial'));
  }, [runFetch]);

  const loadMore = useCallback(() => {
    if (isFetchingRef.current || isLoading || isRefreshing || !hasMore || error) return;
    runFetch(pageRef.current + 1, 'more');
  }, [runFetch, isLoading, isRefreshing, hasMore, error]);

  const refresh = useCallback(() => {
    if (isFetchingRef.current) return;
    setHasMore(true);
    runFetch(1, 'refresh');
  }, [runFetch]);

  return { images, isLoading, isLoadingMore, isRefreshing, error, hasMore, loadMore, refresh };
}
