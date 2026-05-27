import { NgIf } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { Song } from '@models/song.model';
import { SupabaseService } from '@services/supabase.service';

@Component({
  selector: 'app-song-detail',
  standalone: true,
  imports: [NgIf, RouterLink],
  templateUrl: './song-detail.component.html',
  styleUrl: './song-detail.component.scss'
})
export class SongDetailComponent {
  private readonly route = inject(ActivatedRoute);
  private readonly supabaseService = inject(SupabaseService);

  protected readonly song = signal<Song | null>(null);
  protected readonly errorMessage = signal('');
  protected readonly isLoading = signal(true);

  constructor() {
    void this.loadSong();
  }

  private async loadSong(): Promise<void> {
    const id = this.route.snapshot.paramMap.get('id');

    if (!id) {
      this.errorMessage.set('Song not found.');
      this.isLoading.set(false);
      return;
    }

    try {
      const song = await this.supabaseService.getSongById(id);
      this.song.set(song);

      if (!song) {
        this.errorMessage.set('Song not found.');
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unable to load this song from Supabase.';
      this.errorMessage.set(message);
    } finally {
      this.isLoading.set(false);
    }
  }
}
