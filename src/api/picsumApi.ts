import type { PicsumImage } from '../types/gallery';

const BASE_URL = 'https://picsum.photos/v2/list';

export class PicsumApiError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'PicsumApiError';
  }
}

function isPicsumImage(value: unknown): value is PicsumImage {
  if (typeof value !== 'object' || value === null) return false;
  const candidate = value as Record<string, unknown>;
  return (
    typeof candidate.id === 'string' &&
    typeof candidate.author === 'string' &&
    typeof candidate.download_url === 'string' &&
    typeof candidate.url === 'string'
  );
}

export function buildThumbnailUrl(id: string, size = 300): string {
  return `https://picsum.photos/id/${id}/${size}/${size}`;
}

export function buildFullImageUrl(image: PicsumImage): string {
  return `https://picsum.photos/id/${image.id}/${image.width}/${image.height}`;
}

export async function fetchImages(page: number, limit: number, signal?: AbortSignal): Promise<PicsumImage[]> {
  let response: Response;
  try {
    response = await fetch(`${BASE_URL}?page=${page}&limit=${limit}`, { signal });
  } catch (error) {
    if (error instanceof Error && error.name === 'AbortError') {
      throw error;
    }
    throw new PicsumApiError('Network request failed. Please check your internet connection.');
  }

  if (!response.ok) {
    throw new PicsumApiError(`Failed to load images (status ${response.status}).`);
  }

  let data: unknown;
  try {
    data = await response.json();
  } catch {
    throw new PicsumApiError('Received an unexpected response from the server.');
  }

  if (!Array.isArray(data)) {
    throw new PicsumApiError('Received malformed image data from the server.');
  }

  const images = data.filter(isPicsumImage);
  return images;
}
