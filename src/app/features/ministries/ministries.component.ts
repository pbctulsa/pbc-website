import { DatePipe, NgFor, NgIf, TitleCasePipe } from '@angular/common';
import { Component, computed, effect, inject, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { map } from 'rxjs';
import { getMinistryBySlug, ministries } from '@core/ministries';
import { MinistryFeedItem } from '@models/ministry-feed-item.model';
import { MinistryFeedService } from '@services/ministry-feed.service';
import { LanguageService, TranslationKey } from '@services/language.service';

@Component({
  selector: 'app-ministries',
  standalone: true,
  imports: [DatePipe, NgFor, NgIf, TitleCasePipe, RouterLink],
  templateUrl: './ministries.component.html',
  styleUrl: './ministries.component.scss'
})
export class MinistriesComponent {
  private readonly route = inject(ActivatedRoute);
  private readonly ministryFeedService = inject(MinistryFeedService);
  private readonly languageService = inject(LanguageService);

  protected readonly ministries = ministries;
  protected readonly feedItems = signal<MinistryFeedItem[]>([]);
  protected readonly feedLoading = signal(false);
  protected readonly feedError = signal('');
  protected readonly slug = toSignal(
    this.route.paramMap.pipe(map((params) => params.get('slug'))),
    { initialValue: null }
  );
  protected readonly selectedMinistry = computed(() => getMinistryBySlug(this.slug()));
  protected readonly isInvalidSlug = computed(() => this.slug() !== null && !this.selectedMinistry());

  constructor() {
    effect(() => {
      const ministry = this.selectedMinistry();

      if (!ministry?.social) {
        this.feedItems.set([]);
        this.feedError.set('');
        this.feedLoading.set(false);
        return;
      }

      void this.loadFeed(ministry.slug);
    });
  }

  protected selectMinistryPath(slug: string): string {
    return `/ministries/${slug}`;
  }

  protected t(key: TranslationKey): string {
    return this.languageService.t(key);
  }

  private async loadFeed(slug: string): Promise<void> {
    this.feedLoading.set(true);
    this.feedError.set('');

    try {
      const items = await this.ministryFeedService.getFeed(slug);
      this.feedItems.set(items);
    } catch (error) {
      const message = error instanceof Error ? error.message : this.t('ministries.feedError');
      this.feedError.set(message);
      this.feedItems.set([]);
    } finally {
      this.feedLoading.set(false);
    }
  }
}
