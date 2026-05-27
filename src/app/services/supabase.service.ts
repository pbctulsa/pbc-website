import { Injectable } from '@angular/core';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { environment } from '@environments/environment';
import { Song } from '@models/song.model';

type SongRow = Record<string, unknown>;

@Injectable({
  providedIn: 'root'
})
export class SupabaseService {
  private client?: SupabaseClient;
  private readonly songsTable = environment.supabase.songsTable;

  get supabase(): SupabaseClient {
    return this.getClient();
  }

  async getSongs(): Promise<{ songs: Song[]; total: number }> {
    const pageSize = 1000;
    const allRows: SongRow[] = [];
    let total = 0;
    let page = 0;

    while (true) {
      const from = page * pageSize;
      const to = from + pageSize - 1;
      const { data, error, count } = await this.getClient()
        .from(this.songsTable)
        .select('*', { count: page === 0 ? 'exact' : undefined })
        .range(from, to);

      if (error) {
        throw error;
      }

      if (page === 0) {
        total = count ?? 0;
      }

      allRows.push(...((data ?? []) as SongRow[]));

      if (!data || data.length < pageSize) {
        break;
      }

      page += 1;
    }

    const songs = allRows
      .map((row) => this.mapSongRow(row))
      .sort((a, b) => this.sortSongs(a, b));

    return {
      songs,
      total: total || songs.length
    };
  }

  async getSongById(id: string): Promise<Song | null> {
    const { data, error } = await this.getClient()
      .from(this.songsTable)
      .select('*')
      .eq('id', id)
      .maybeSingle();

    if (error) {
      throw error;
    }

    return data ? this.mapSongRow(data) : null;
  }

  private getClient(): SupabaseClient {
    if (this.client) {
      return this.client;
    }

    if (
      !environment.supabase.url ||
      !environment.supabase.anonKey ||
      environment.supabase.url === 'YOUR_SUPABASE_URL' ||
      environment.supabase.anonKey === 'YOUR_SUPABASE_ANON_KEY'
    ) {
      throw new Error('Supabase URL and anon key are not configured.');
    }

    this.client = createClient(environment.supabase.url, environment.supabase.anonKey);
    return this.client;
  }

  private mapSongRow(row: SongRow): Song {
    const id = this.firstString(row, ['id', 'song_id', 'slug']);
    const title = this.firstString(row, ['title', 'song_title', 'name']) || 'Untitled Song';

    return {
      id: id || title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''),
      title,
      number: this.firstNumber(row, ['number', 'song_number', 'song_no', 'hymn_number']),
      author: this.firstString(row, ['author', 'artist', 'writer', 'composer']),
      category: this.firstString(row, ['category', 'book', 'song_type', 'songType', 'type']),
      lyrics: this.firstString(row, ['lyrics_text', 'lyrics', 'song_lyrics', 'body', 'content', 'text']),
      lyricsHtml: this.firstString(row, ['lyrics_html', 'lyricsHtml']),
      songKey: this.firstString(row, ['song_key', 'key']),
      source: this.firstString(row, ['source', 'resource']),
      created_at: this.firstString(row, ['created_at', 'createdAt'])
    };
  }

  private firstString(row: SongRow, keys: string[]): string | undefined {
    for (const key of keys) {
      const value = row[key];

      if (typeof value === 'string' && value.trim()) {
        return value.trim();
      }

      if (typeof value === 'number') {
        return value.toString();
      }
    }

    return undefined;
  }

  private firstNumber(row: SongRow, keys: string[]): number | undefined {
    for (const key of keys) {
      const value = row[key];

      if (typeof value === 'number') {
        return value;
      }

      if (typeof value === 'string' && value.trim() && !Number.isNaN(Number(value))) {
        return Number(value);
      }
    }

    return undefined;
  }

  private sortSongs(a: Song, b: Song): number {
    if (a.number && b.number) {
      return a.number - b.number;
    }

    if (a.number) {
      return -1;
    }

    if (b.number) {
      return 1;
    }

    return a.title.localeCompare(b.title);
  }
}
