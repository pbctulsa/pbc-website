import { Component } from '@angular/core';
import { NgFor } from '@angular/common';
import { RouterLink } from '@angular/router';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { churchInfo } from '@core/church-info';
import { LanguageService, TranslationKey } from '@services/language.service';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [NgFor, RouterLink],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss'
})
export class HomeComponent {
  protected readonly church = churchInfo;
  protected readonly latestVideoUrl: SafeResourceUrl;

  constructor(sanitizer: DomSanitizer, private readonly languageService: LanguageService) {
    this.latestVideoUrl = sanitizer.bypassSecurityTrustResourceUrl(churchInfo.links.youtubeUploadsEmbed);
  }

  protected t(key: TranslationKey): string {
    return this.languageService.t(key);
  }
}
