import { NgFor, NgIf } from '@angular/common';
import { Component, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { Song } from '@models/song.model';
import { CloudflareDataService } from '@services/cloudflare-data.service';

@Component({
  selector: 'app-songbook',
  standalone: true,
  imports: [FormsModule, NgFor, NgIf, RouterLink],
  templateUrl: './songbook.component.html',
  styleUrl: './songbook.component.scss'
})
export class SongbookComponent {
  private readonly dataService = inject(CloudflareDataService);

  protected readonly songs = signal<Song[]>([]);
  protected readonly searchTerm = signal('');
  protected readonly selectedType = signal('All Song Type');
  protected readonly isLoading = signal(true);
  protected readonly errorMessage = signal('');
  protected readonly totalSongs = signal(0);

  protected readonly songTypes = computed(() => {
    const types = new Set(
      this.songs()
        .map((song) => song.category)
        .filter((category): category is string => Boolean(category))
    );

    return ['All Song Type', ...Array.from(types).sort((a, b) => a.localeCompare(b))];
  });

  protected readonly filteredSongs = computed(() => {
    const term = this.searchTerm().trim().toLowerCase();
    const selectedType = this.selectedType();

    return this.songs().filter((song) => {
      const matchesType = selectedType === 'All Song Type' || song.category === selectedType;
      const matchesSearch =
        !term ||
        [song.title, song.author, song.category, song.number?.toString(), song.lyrics]
        .filter(Boolean)
        .some((value) => value?.toLowerCase().includes(term));

      return matchesType && matchesSearch;
    });
  });

  constructor() {
    void this.loadSongs();
  }

  protected updateSearchTerm(value: string): void {
    this.searchTerm.set(value);
  }

  protected updateSelectedType(value: string): void {
    this.selectedType.set(value);
  }

  protected clearFilters(): void {
    this.searchTerm.set('');
    this.selectedType.set('All Song Type');
  }

  private async loadSongs(): Promise<void> {
    try {
      const { songs, total } = await this.dataService.getSongs();
      this.songs.set(songs);
      this.totalSongs.set(total);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unable to load songs from Cloudflare.';
      this.errorMessage.set(message);
    } finally {
      this.isLoading.set(false);
    }
  }
}
