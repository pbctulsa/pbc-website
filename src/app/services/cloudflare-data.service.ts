import { Injectable } from '@angular/core';
import { environment } from '@environments/environment';
import { StaffMember, StaffTerm } from '@models/staff-member.model';
import { Song } from '@models/song.model';

type SongRow = Record<string, unknown>;
type SongEditSuggestion = {
  song: Song;
  suggested: {
    title: string;
    author: string;
    category: string;
    songKey: string;
    lyrics: string;
  };
  submitterName?: string;
  submitterEmail?: string;
  note?: string;
};
type StaffRow = Record<string, unknown> & {
  staff_terms?: StaffTermRow[];
};
type StaffTermRow = Record<string, unknown>;

@Injectable({
  providedIn: 'root'
})
export class CloudflareDataService {
  private readonly apiBaseUrl = environment.cloudflare.apiBaseUrl.replace(/\/$/, '');

  async getSongs(): Promise<{ songs: Song[]; total: number }> {
    const data = await this.fetchJson<{ songs?: SongRow[]; total?: number }>('/api/songs');
    const allRows = data.songs ?? [];

    const songs = allRows
      .map((row) => this.mapSongRow(row))
      .sort((a, b) => this.sortSongs(a, b));

    return {
      songs,
      total: data.total ?? songs.length
    };
  }

  async getSongById(id: string): Promise<Song | null> {
    const response = await fetch(this.url(`/api/songs/${encodeURIComponent(id)}`), {
      headers: { Accept: 'application/json' }
    });

    if (response.status === 404) {
      return null;
    }

    const data = await this.parseResponse<{ song?: SongRow }>(response);
    return data.song ? this.mapSongRow(data.song) : null;
  }

  async submitSongEditSuggestion(suggestion: SongEditSuggestion): Promise<void> {
    const { song, suggested } = suggestion;
    const original = {
      title: song.title || '',
      author: song.author || '',
      category: song.category || '',
      songKey: song.songKey || '',
      lyrics: song.lyrics || ''
    };

    await this.fetchJson('/api/song-edit-suggestions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        songId: song.id,
        songTitle: song.title,
        songNumber: song.number ?? null,
        originalFields: original,
        suggestedFields: suggested,
        submitterName: this.blankToNull(suggestion.submitterName),
        submitterEmail: this.blankToNull(suggestion.submitterEmail),
        note: this.blankToNull(suggestion.note)
      })
    });
  }

  async getStaff(): Promise<StaffMember[]> {
    const data = await this.fetchJson<{ staff?: StaffRow[] }>('/api/staff');
    return (data.staff ?? []).map((row) => this.mapStaffRow(row));
  }

  async getStaffById(id: string): Promise<StaffMember | null> {
    const response = await fetch(this.url(`/api/staff/${encodeURIComponent(id)}`), {
      headers: { Accept: 'application/json' }
    });

    if (response.status === 404) {
      return null;
    }

    const data = await this.parseResponse<{ staff?: StaffRow }>(response);
    return data.staff ? this.mapStaffRow(data.staff) : null;
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
      const aOrder = this.firstNumber(a, ['order', 'term_order']) ?? Number.MAX_SAFE_INTEGER;
      const bOrder = this.firstNumber(b, ['order', 'term_order']) ?? Number.MAX_SAFE_INTEGER;

      if (aOrder !== bOrder) {
        return aOrder - bOrder;
      }

      const aCurrent = this.isTrue(a['is_current']) ? 1 : 0;
      const bCurrent = this.isTrue(b['is_current']) ? 1 : 0;

      if (aCurrent !== bCurrent) {
        return bCurrent - aCurrent;
      }

      return (this.firstNumber(b, ['term_start_year']) || 0) - (this.firstNumber(a, ['term_start_year']) || 0);
        })
      : [];
    const currentTerms = terms.filter((term) => this.isTrue(term['is_current']));
    const currentTerm =
      currentTerms[0] ||
      terms.find((term) => this.isTrue(term['is_current'])) ||
      terms[0];
    const currentDepartments = Array.from(
      new Set(currentTerms.flatMap((term) => this.firstStringArray(term, ['departments'])))
    );
    const name = this.firstString(row, ['name']) || 'Unnamed Staff Member';
    const role = this.firstString(currentTerm || {}, ['role']) || 'Staff';

    return {
      id: this.firstString(row, ['id']) || name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''),
      name,
      role,
      department: this.firstString(currentTerm || {}, ['department']),
      departments: currentDepartments,
      bylaw: this.firstString(currentTerm || {}, ['bylaw']),
      termStartYear: this.firstNumber(currentTerm || {}, ['term_start_year']),
      termEndYear: this.firstNumber(currentTerm || {}, ['term_end_year']),
      order: this.firstNumber(currentTerm || {}, ['order', 'term_order']),
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
      departments: this.firstStringArray(row, ['departments']),
      bylaw: this.firstString(row, ['bylaw']),
      termStartYear: this.firstNumber(row, ['term_start_year']),
      termEndYear: this.firstNumber(row, ['term_end_year']),
      order: this.firstNumber(row, ['order', 'term_order']),
      isCurrent: this.isTrue(row['is_current'])
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

  private firstStringArray(row: SongRow, keys: string[]): string[] {
    for (const key of keys) {
      const value = row[key];

      if (Array.isArray(value)) {
        return value
          .filter((item): item is string => typeof item === 'string')
          .map((item) => item.trim())
          .filter(Boolean);
      }

      if (typeof value === 'string' && value.trim()) {
        try {
          const parsed = JSON.parse(value);

          if (Array.isArray(parsed)) {
            return parsed
              .filter((item): item is string => typeof item === 'string')
              .map((item) => item.trim())
              .filter(Boolean);
          }
        } catch {
          return value
            .split(',')
            .map((item) => item.trim())
            .filter(Boolean);
        }
      }
    }

    return [];
  }

  private async fetchJson<T>(path: string, init?: RequestInit): Promise<T> {
    return this.parseResponse<T>(
      await fetch(this.url(path), {
        headers: {
          Accept: 'application/json',
          ...init?.headers
        },
        ...init
      })
    );
  }

  private async parseResponse<T>(response: Response): Promise<T> {
    if (!response.ok) {
      const body = await response.text();
      throw new Error(body || 'Request failed.');
    }

    return (await response.json()) as T;
  }

  private url(path: string): string {
    return `${this.apiBaseUrl}${path}`;
  }

  private isTrue(value: unknown): boolean {
    return value === true || value === 1 || value === '1';
  }

  private blankToNull(value: string | undefined): string | null {
    const trimmed = value?.trim();

    return trimmed ? trimmed : null;
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
