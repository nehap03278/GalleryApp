export interface PicsumImage {
  id: string;
  author: string;
  width: number;
  height: number;
  url: string;
  download_url: string;
}

export type AuthorFilter = 'ALL' | 'A_M' | 'N_Z';
