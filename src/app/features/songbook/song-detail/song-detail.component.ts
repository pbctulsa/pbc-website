import { NgIf } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { FormsModule, NgForm } from '@angular/forms';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { Song } from '@models/song.model';
import { SupabaseService } from '@services/supabase.service';

@Component({
  selector: 'app-song-detail',
  standalone: true,
  imports: [FormsModule, NgIf, RouterLink],
  templateUrl: './song-detail.component.html',
  styleUrl: './song-detail.component.scss'
})
export class SongDetailComponent {
  private readonly route = inject(ActivatedRoute);
  private readonly supabaseService = inject(SupabaseService);

  protected readonly song = signal<Song | null>(null);
  protected readonly errorMessage = signal('');
  protected readonly isLoading = signal(true);
  protected readonly isSuggestingEdit = signal(false);
  protected readonly isSubmittingSuggestion = signal(false);
  protected readonly suggestionMessage = signal('');
  protected readonly suggestionError = signal('');
  protected readonly suggestion = {
    title: '',
    author: '',
    category: '',
    songKey: '',
    lyrics: '',
    submitterName: '',
    submitterEmail: '',
    note: '',
    website: ''
  };

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

  protected openSuggestionForm(): void {
    const song = this.song();

    if (!song) {
      return;
    }

    this.suggestion.title = song.title || '';
    this.suggestion.author = song.author || '';
    this.suggestion.category = song.category || '';
    this.suggestion.songKey = song.songKey || '';
    this.suggestion.lyrics = song.lyrics || '';
    this.suggestion.note = '';
    this.suggestion.website = '';
    this.suggestionError.set('');
    this.suggestionMessage.set('');
    this.isSuggestingEdit.set(true);
  }

  protected cancelSuggestionForm(form: NgForm): void {
    form.resetForm();
    this.isSuggestingEdit.set(false);
    this.suggestionError.set('');
  }

  protected async submitSuggestion(form: NgForm): Promise<void> {
    const song = this.song();

    if (!song || form.invalid || this.isSubmittingSuggestion()) {
      return;
    }

    if (this.suggestion.website.trim()) {
      return;
    }

    const suggested = {
      title: this.suggestion.title.trim(),
      author: this.suggestion.author.trim(),
      category: this.suggestion.category.trim(),
      songKey: this.suggestion.songKey.trim(),
      lyrics: this.suggestion.lyrics.trim()
    };

    if (!this.hasSuggestionChange(song, suggested) && !this.suggestion.note.trim()) {
      this.suggestionError.set('Change at least one field or add a note before submitting.');
      return;
    }

    this.isSubmittingSuggestion.set(true);
    this.suggestionError.set('');
    this.suggestionMessage.set('');

    try {
      await this.supabaseService.submitSongEditSuggestion({
        song,
        suggested,
        submitterName: this.suggestion.submitterName,
        submitterEmail: this.suggestion.submitterEmail,
        note: this.suggestion.note
      });
      form.resetForm();
      this.isSuggestingEdit.set(false);
      this.suggestionMessage.set('Suggestion submitted for review.');
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unable to submit this suggestion.';
      this.suggestionError.set(message);
    } finally {
      this.isSubmittingSuggestion.set(false);
    }
  }

  private hasSuggestionChange(
    song: Song,
    suggested: { title: string; author: string; category: string; songKey: string; lyrics: string }
  ): boolean {
    return (
      suggested.title !== (song.title || '') ||
      suggested.author !== (song.author || '') ||
      suggested.category !== (song.category || '') ||
      suggested.songKey !== (song.songKey || '') ||
      suggested.lyrics !== (song.lyrics || '')
    );
  }
}
