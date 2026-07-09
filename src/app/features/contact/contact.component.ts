import { NgFor } from '@angular/common';
import { Component } from '@angular/core';
import { churchInfo } from '@core/church-info';
import { LanguageService, TranslationKey } from '@services/language.service';

@Component({
  selector: 'app-contact',
  standalone: true,
  imports: [NgFor],
  template: `
    <section class="page-section">
      <div class="section-inner">
        <p class="eyebrow">{{ t('contact.eyebrow') }}</p>
        <h1 class="section-title">{{ t('contact.title') }} {{ church.shortName }}</h1>
        <p class="lead">{{ t('home.community') }}</p>
        <div class="contact-grid">
          <article>
            <h2>{{ t('contact.address') }}</h2>
            <p>{{ church.address }}</p>
            <p>{{ church.phone }}</p>
          </article>

          <article>
            <h2>{{ t('contact.serviceTimes') }}</h2>
            <p *ngFor="let service of church.serviceTimes">
              <strong>{{ serviceLabel(service.label) }}</strong>
              <span>{{ service.time }}</span>
            </p>
          </article>

          <article>
            <h2>{{ t('contact.memberLinks') }}</h2>
            <a [href]="church.links.bulletin" target="_blank" rel="noreferrer">{{ t('contact.bulletin') }}</a>
            <a [href]="church.links.calendar" target="_blank" rel="noreferrer">{{ t('contact.calendar') }}</a>
            <a [href]="church.links.directory" target="_blank" rel="noreferrer">{{ t('contact.directory') }}</a>
          </article>

          <article>
            <h2>{{ t('contact.followOnline') }}</h2>
            <a *ngFor="let link of church.socialLinks" [href]="link.url" target="_blank" rel="noreferrer">
              {{ link.label }}
            </a>
          </article>
        </div>
      </div>
    </section>
  `,
  styles: [
    `
      .contact-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(min(100%, 18rem), 1fr));
        margin-top: 2rem;
        gap: 1rem;
      }

      .contact-photo {
        display: block;
        width: 100%;
        margin-top: 1rem;
        border-radius: 0.5rem;
        aspect-ratio: 16 / 7;
        object-fit: cover;
      }

      .lead {
        max-width: 46rem;
        margin: 0.75rem 0 0;
        color: var(--color-muted);
        font-size: 1.1rem;
        line-height: 1.6;
      }

      article {
        border: 1px solid var(--color-border);
        border-radius: 0.5rem;
        padding: 1.25rem;
      }

      h2 {
        margin: 0 0 0.75rem;
        color: var(--color-blue-900);
        font-family: var(--font-serif);
      }

      p,
      a {
        display: block;
        margin: 0.35rem 0;
      }

      a {
        color: var(--color-red-700);
        font-weight: 800;
      }
    `
  ]
})
export class ContactComponent {
  protected readonly church = churchInfo;

  constructor(private readonly languageService: LanguageService) {}

  protected t(key: TranslationKey): string {
    return this.languageService.t(key);
  }

  protected serviceLabel(label: string): string {
    switch (label) {
      case 'Sunday Worship Service':
        return this.t('contact.sundayWorshipService');
      case 'English Worship Service':
        return this.t('contact.englishWorshipService');
      case 'Wednesday Bible Study':
        return this.t('contact.wednesdayBibleStudy');
      default:
        return label;
    }
  }
}
