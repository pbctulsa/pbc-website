export interface Song {
  id: string;
  title: string;
  number?: number;
  author?: string;
  category?: string;
  lyrics?: string;
  lyricsHtml?: string;
  songKey?: string;
  source?: string;
  created_at?: string;
}
