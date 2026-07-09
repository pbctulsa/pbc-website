import { NgFor } from '@angular/common';
import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { churchInfo } from '@core/church-info';
import { LanguageService, TranslationKey } from '@services/language.service';

@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [NgFor, RouterLink],
  templateUrl: './footer.component.html',
  styleUrl: './footer.component.scss'
})
export class FooterComponent {
  protected readonly church = churchInfo;
  protected readonly currentYear = new Date().getFullYear();

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
