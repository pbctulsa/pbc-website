import { NgFor } from '@angular/common';
import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { churchInfo } from '@core/church-info';
import { LanguageService, TranslationKey } from '@services/language.service';

@Component({
  selector: 'app-about',
  standalone: true,
  imports: [NgFor, RouterLink],
  template: `
    <section class="page-section">
      <div class="section-inner">
        <p class="eyebrow">{{ t('about.eyebrow') }}</p>
        <h1 class="section-title">{{ t('about.title') }} {{ church.name }}</h1>

        <div class="about-hero">
          <div>
            <p class="lead">
              {{ t('about.lead') }}
            </p>
            <div class="mission-pair">
              <article>
                <h2>{{ t('about.missionTitle') }}</h2>
                <p>{{ t('about.missionText') }}</p>
              </article>
              <article>
                <h2>{{ t('about.visionTitle') }}</h2>
                <p>{{ t('about.visionText') }}</p>
              </article>
            </div>
          </div>
          <img [src]="church.gallery[0].src" [alt]="church.gallery[0].alt" loading="lazy">
        </div>

        <section class="belief-section" aria-labelledby="belief-heading">
          <div>
            <p class="eyebrow">{{ t('about.beliefEyebrow') }}</p>
            <h2 id="belief-heading">{{ t('about.beliefTitle') }}</h2>
            <p>
              {{ t('about.beliefText') }}
            </p>
          </div>
          <div class="belief-grid">
            <article *ngFor="let belief of beliefs">
              <span>{{ t(belief.label) }}</span>
              <h3>{{ t(belief.title) }}</h3>
              <p>{{ t(belief.text) }}</p>
            </article>
          </div>
        </section>

        <section class="church-life" aria-labelledby="life-heading">
          <img [src]="church.gallery[2].src" [alt]="church.gallery[2].alt" loading="lazy">
          <div>
            <p class="eyebrow">{{ t('about.lifeEyebrow') }}</p>
            <h2 id="life-heading">{{ t('about.lifeTitle') }}</h2>
            <p>
              {{ t('about.lifeText1') }}
            </p>
            <p>
              {{ t('about.lifeText2') }}
            </p>
          </div>
        </section>

        <section class="affiliation-band" aria-label="Church affiliations">
          <p>
            {{ church.shortName }} {{ t('about.affiliationText') }}
          </p>
          <p class="bylaws-note">
            {{ t('about.bylawsNote') }}
          </p>
          <a class="button-link" routerLink="/about/bylaws">
            {{ t('about.bylawsButton') }}
          </a>
        </section>

        <div class="photo-grid" aria-label="Church photo gallery">
          <img
            *ngFor="let photo of church.gallery.slice(3, 9)"
            [src]="photo.src"
            [alt]="photo.alt"
            loading="lazy"
          >
        </div>
      </div>
    </section>
  `,
  styles: [
    `
      .about-hero {
        display: grid;
        grid-template-columns: minmax(0, 1.25fr) minmax(16rem, 0.75fr);
        align-items: start;
        margin-top: 1.5rem;
        gap: 2rem;
      }

      .about-hero > img,
      .church-life > img {
        display: block;
        width: 100%;
        border-radius: 0.5rem;
        object-fit: cover;
      }

      .about-hero > img {
        height: clamp(14rem, 26vw, 20rem);
        aspect-ratio: 4 / 3;
      }

      .mission-pair {
        display: grid;
        grid-template-columns: repeat(2, minmax(0, 1fr));
        margin-top: 1.5rem;
        gap: 1rem;
      }

      .mission-pair article {
        border-top: 4px solid var(--color-red-700);
        padding: 1.25rem;
        background: var(--color-surface);
      }

      h2 {
        margin: 0 0 0.5rem;
        color: var(--color-blue-900);
        font-family: var(--font-serif);
      }

      h3 {
        margin: 0 0 0.5rem;
        color: var(--color-blue-900);
        font-family: var(--font-serif);
        font-size: 1.25rem;
      }

      p,
      .lead {
        margin: 0;
        color: var(--color-muted);
      }

      .lead {
        max-width: 52rem;
        font-size: clamp(1.05rem, 2vw, 1.25rem);
        line-height: 1.7;
      }

      .belief-section {
        display: grid;
        grid-template-columns: 0.75fr 1.25fr;
        margin-top: 3rem;
        gap: 2rem;
      }

      .belief-section h2,
      .church-life h2 {
        font-size: clamp(1.8rem, 4vw, 3rem);
        line-height: 1.08;
      }

      .belief-grid {
        display: grid;
        grid-template-columns: repeat(2, minmax(0, 1fr));
        gap: 1rem;
      }

      .belief-grid article {
        border: 1px solid var(--color-border);
        border-radius: 0.5rem;
        padding: 1rem;
        background: var(--color-white);
      }

      .belief-grid span {
        display: block;
        margin-bottom: 0.5rem;
        color: var(--color-red-700);
        font-size: 0.78rem;
        font-weight: 800;
        letter-spacing: 0.08em;
        text-transform: uppercase;
      }

      .church-life {
        display: grid;
        grid-template-columns: minmax(14rem, 0.65fr) minmax(0, 1.35fr);
        align-items: center;
        margin-top: 3rem;
        gap: 2rem;
      }

      .church-life > img {
        height: 16rem;
        aspect-ratio: 1 / 1;
      }

      .church-life p + p {
        margin-top: 1rem;
      }

      .affiliation-band {
        margin-top: 3rem;
        border-left: 4px solid var(--color-red-700);
        padding: 1.25rem 1.5rem;
        background: var(--color-surface);
      }

      .affiliation-band p {
        max-width: 58rem;
        color: var(--color-blue-900);
        font-weight: 800;
      }

      .affiliation-band .bylaws-note {
        margin-top: 0.75rem;
        color: var(--color-muted);
        font-weight: 500;
      }

      .affiliation-band .button-link {
        margin-top: 1rem;
      }

      .photo-grid {
        display: grid;
        grid-template-columns: repeat(6, minmax(0, 1fr));
        margin-top: 1rem;
        gap: 0.75rem;
      }

      .photo-grid img {
        display: block;
        width: 100%;
        margin: 0;
        border-radius: 0.5rem;
        aspect-ratio: 1 / 1;
        object-fit: cover;
      }

      @media (max-width: 760px) {
        .photo-grid {
          grid-template-columns: repeat(2, 1fr);
        }
      }

      @media (max-width: 900px) {
        .about-hero,
        .belief-section,
        .church-life {
          grid-template-columns: 1fr;
        }

        .about-hero > img {
          height: 16rem;
        }

        .church-life > img {
          height: 16rem;
        }
      }

      @media (max-width: 640px) {
        .mission-pair,
        .belief-grid {
          grid-template-columns: 1fr;
        }
      }
    `
  ]
})
export class AboutComponent {
  protected readonly church = churchInfo;
  protected readonly beliefs = [
    {
      label: 'about.belief1Label',
      title: 'about.belief1Title',
      text: 'about.belief1Text'
    },
    {
      label: 'about.belief2Label',
      title: 'about.belief2Title',
      text: 'about.belief2Text'
    },
    {
      label: 'about.belief3Label',
      title: 'about.belief3Title',
      text: 'about.belief3Text'
    },
    {
      label: 'about.belief4Label',
      title: 'about.belief4Title',
      text: 'about.belief4Text'
    }
  ] as const;

  constructor(private readonly languageService: LanguageService) {}

  protected t(key: TranslationKey): string {
    return this.languageService.t(key);
  }
}
