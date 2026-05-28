import { Component } from '@angular/core';
import { churchInfo } from '@core/church-info';

@Component({
  selector: 'app-sermons',
  standalone: true,
  template: `
    <section class="page-section">
      <div class="section-inner">
        <p class="eyebrow">Sermons</p>
        <h1 class="section-title">Sermons and live worship</h1>
        <p class="lead">
          Use this page for sermon archives, livestream embeds, podcast links, and worship media.
        </p>
        <img class="sermons-photo" [src]="church.gallery[1].src" [alt]="church.gallery[1].alt" loading="lazy">

        <div class="media-actions">
          <a class="button-link" [href]="church.links.youtube" target="_blank" rel="noreferrer">YouTube</a>
          <a class="button-link secondary" [href]="church.links.podcast" target="_blank" rel="noreferrer">Podcast</a>
          <a class="button-link secondary" [href]="church.links.facebook" target="_blank" rel="noreferrer">Facebook</a>
          <a class="button-link secondary" [href]="church.links.instagram" target="_blank" rel="noreferrer">Instagram</a>
          <a class="button-link secondary" [href]="church.links.mediaForm" target="_blank" rel="noreferrer">Media Form</a>
        </div>
      </div>
    </section>
  `,
  styles: [
    `
      .media-actions {
        display: flex;
        flex-wrap: wrap;
        margin-top: 2rem;
        gap: 0.75rem;
      }

      .sermons-photo {
        display: block;
        width: 100%;
        margin-top: 1.5rem;
        border-radius: 0.5rem;
        aspect-ratio: 16 / 7;
        object-fit: cover;
      }
    `
  ]
})
export class SermonsComponent {
  protected readonly church = churchInfo;
}
