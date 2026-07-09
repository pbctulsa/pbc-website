import { Component } from '@angular/core';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { churchInfo } from '@core/church-info';
import { LanguageService, TranslationKey } from '@services/language.service';

@Component({
  selector: 'app-bylaws',
  standalone: true,
  template: `
    <section class="page-section">
      <div class="section-inner">
        <p class="eyebrow">{{ t('bylaws.eyebrow') }}</p>
        <h1 class="section-title">{{ t('bylaws.title') }}</h1>
        <p class="lead">
          {{ t('bylaws.leadPrefix') }} {{ church.shortName }} {{ t('bylaws.leadSuffix') }}
        </p>

        <div class="bylaws-actions" aria-label="Bylaws document actions">
          <a class="button-link" [href]="church.links.bylaws" target="_blank" rel="noreferrer">
            {{ t('bylaws.viewPdf') }}
          </a>
          <a class="button-link secondary" [href]="church.links.bylaws" download>
            {{ t('bylaws.download') }}
          </a>
        </div>

        <div class="document-viewer">
          <iframe
            title="Peniel Baptist Church bylaws and policy document"
            [src]="bylawsViewerUrl"
          ></iframe>
        </div>
      </div>
    </section>
  `,
  styles: [
    `
      .lead {
        max-width: 52rem;
      }

      .bylaws-actions {
        display: flex;
        flex-wrap: wrap;
        margin-top: 1.5rem;
        gap: 0.75rem;
      }

      .document-viewer {
        min-height: 36rem;
        margin-top: 2rem;
        border: 1px solid var(--color-border);
        border-radius: 0.5rem;
        overflow: hidden;
        background: var(--color-surface);
      }

      iframe {
        display: block;
        width: 100%;
        height: min(72vh, 52rem);
        min-height: 36rem;
        border: 0;
        background: var(--color-white);
      }

      @media (max-width: 640px) {
        .bylaws-actions .button-link {
          width: 100%;
        }

        .document-viewer,
        iframe {
          min-height: 28rem;
        }
      }
    `
  ]
})
export class BylawsComponent {
  protected readonly church = churchInfo;
  protected readonly bylawsViewerUrl: SafeResourceUrl;

  constructor(sanitizer: DomSanitizer, private readonly languageService: LanguageService) {
    this.bylawsViewerUrl = sanitizer.bypassSecurityTrustResourceUrl(churchInfo.links.bylaws);
  }

  protected t(key: TranslationKey): string {
    return this.languageService.t(key);
  }
}
