import { NgFor } from '@angular/common';
import { Component } from '@angular/core';
import { churchInfo } from '@core/church-info';

@Component({
  selector: 'app-about',
  standalone: true,
  imports: [NgFor],
  template: `
    <section class="page-section">
      <div class="section-inner">
        <p class="eyebrow">About</p>
        <h1 class="section-title">About {{ church.name }}</h1>
        <div class="statement-grid">
          <article>
            <h2>Mission Statement</h2>
            <p>{{ church.mission }}</p>
            <img [src]="church.gallery[0].src" [alt]="church.gallery[0].alt" loading="lazy">
          </article>
          <article>
            <h2>Vision Statement</h2>
            <p>{{ church.vision }}</p>
            <img [src]="church.gallery[2].src" [alt]="church.gallery[2].alt" loading="lazy">
          </article>
        </div>

        <div class="photo-grid" aria-label="Church photos">
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
      .statement-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(min(100%, 20rem), 1fr));
        margin-top: 2rem;
        gap: 1rem;
      }

      article {
        border-top: 4px solid var(--color-red-700);
        padding: 1.25rem;
        background: var(--color-surface);
      }

      h2 {
        margin: 0 0 0.5rem;
        color: var(--color-blue-900);
        font-family: var(--font-serif);
      }

      p {
        margin: 0;
        color: var(--color-muted);
      }

      img {
        display: block;
        width: 100%;
        margin-top: 1.25rem;
        border-radius: 0.35rem;
        aspect-ratio: 4 / 3;
        object-fit: cover;
      }

      .photo-grid {
        display: grid;
        grid-template-columns: repeat(6, 1fr);
        margin-top: 1rem;
        gap: 0.75rem;
      }

      .photo-grid img {
        margin: 0;
        aspect-ratio: 1 / 1;
      }

      .photo-grid img:nth-child(1),
      .photo-grid img:nth-child(4) {
        grid-column: span 2;
        aspect-ratio: 4 / 3;
      }

      @media (max-width: 760px) {
        .photo-grid {
          grid-template-columns: repeat(2, 1fr);
        }

        .photo-grid img:nth-child(1),
        .photo-grid img:nth-child(4) {
          grid-column: span 1;
          aspect-ratio: 1 / 1;
        }
      }
    `
  ]
})
export class AboutComponent {
  protected readonly church = churchInfo;
}
