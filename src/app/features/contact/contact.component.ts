import { NgFor } from '@angular/common';
import { Component } from '@angular/core';
import { churchInfo } from '@core/church-info';

@Component({
  selector: 'app-contact',
  standalone: true,
  imports: [NgFor],
  template: `
    <section class="page-section">
      <div class="section-inner">
        <p class="eyebrow">Contact</p>
        <h1 class="section-title">Visit or contact {{ church.shortName }}</h1>
        <img class="contact-photo" [src]="church.gallery[8].src" [alt]="church.gallery[8].alt" loading="lazy">

        <div class="contact-grid">
          <article>
            <h2>Address</h2>
            <p>{{ church.address }}</p>
            <p>{{ church.phone }}</p>
          </article>

          <article>
            <h2>Service Times</h2>
            <p *ngFor="let service of church.serviceTimes">
              <strong>{{ service.label }}</strong>
              <span>{{ service.time }}</span>
            </p>
          </article>

          <article>
            <h2>Member Links</h2>
            <a [href]="church.links.bulletin" target="_blank" rel="noreferrer">Bulletin</a>
            <a [href]="church.links.calendar" target="_blank" rel="noreferrer">Church Calendar</a>
            <a [href]="church.links.directory" target="_blank" rel="noreferrer">Church Directory</a>
          </article>

          <article>
            <h2>Follow Online</h2>
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
        margin-top: 1.5rem;
        border-radius: 0.5rem;
        aspect-ratio: 16 / 7;
        object-fit: cover;
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
}
