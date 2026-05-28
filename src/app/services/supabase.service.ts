import { Injectable } from '@angular/core';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { environment } from '@environments/environment';
import { StaffMember, StaffTerm } from '@models/staff-member.model';
import { Song } from '@models/song.model';

type SongRow = Record<string, unknown>;
type StaffRow = Record<string, unknown> & {
  staff_terms?: StaffTermRow[];
};
type StaffTermRow = Record<string, unknown>;

@Injectable({
  providedIn: 'root'
})
export class SupabaseService {
  private client?: SupabaseClient;
  private readonly songsTable = environment.supabase.songsTable;
  private readonly staffTable = environment.supabase.staffTable || 'staff';

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

  async getStaff(): Promise<StaffMember[]> {
    const { data, error } = await this.getClient()
      .from(this.staffTable)
      .select(this.staffSelect())
      .eq('is_published', true)
      .order('sort_order', { ascending: true });

    if (error) {
      throw error;
    }

    return ((data ?? []) as unknown as StaffRow[]).map((row) => this.mapStaffRow(row));
  }

  async getStaffById(id: string): Promise<StaffMember | null> {
    const { data, error } = await this.getClient()
      .from(this.staffTable)
      .select(this.staffSelect())
      .eq('id', id)
      .eq('is_published', true)
      .maybeSingle();

    if (error) {
      throw error;
    }

    return data ? this.mapStaffRow(data as unknown as StaffRow) : null;
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

  private mapStaffRow(row: StaffRow): StaffMember {
    const terms = Array.isArray(row.staff_terms)
      ? [...row.staff_terms].sort((a, b) => {
          const aCurrent = a['is_current'] === true ? 1 : 0;
          const bCurrent = b['is_current'] === true ? 1 : 0;

          if (aCurrent !== bCurrent) {
            return bCurrent - aCurrent;
          }

          return (this.firstNumber(b, ['term_start_year']) || 0) - (this.firstNumber(a, ['term_start_year']) || 0);
        })
      : [];
    const currentTerm =
      terms.find((term) => term['is_current'] === true) ||
      terms.find((term) => term['is_current'] !== false) ||
      terms[0];
    const name = this.firstString(row, ['name']) || 'Unnamed Staff Member';
    const role = this.firstString(currentTerm || {}, ['role']) || 'Staff';

    return {
      id: this.firstString(row, ['id']) || name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''),
      name,
      role,
      department: this.firstString(currentTerm || {}, ['department']),
      bylaw: this.firstString(currentTerm || {}, ['bylaw']),
      termStartYear: this.firstNumber(currentTerm || {}, ['term_start_year']),
      termEndYear: this.firstNumber(currentTerm || {}, ['term_end_year']),
      email: this.firstString(row, ['email']),
      phone: this.firstString(row, ['phone']),
      photoUrl: this.firstString(row, ['photo_url']),
      bio: this.firstString(row, ['short_description', 'bio']),
      terms: terms.map((term) => this.mapStaffTerm(term))
    };
  }

  private mapStaffTerm(row: StaffTermRow): StaffTerm {
    return {
      role: this.firstString(row, ['role']) || 'Staff',
      department: this.firstString(row, ['department']),
      bylaw: this.firstString(row, ['bylaw']),
      termStartYear: this.firstNumber(row, ['term_start_year']),
      termEndYear: this.firstNumber(row, ['term_end_year']),
      isCurrent: row['is_current'] === true
    };
  }

  private staffSelect(): string {
    return '*,staff_terms(role,department,bylaw,term_start_year,term_end_year,is_current)';
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
