import { NgFor, NgIf } from '@angular/common';
import { Component, signal } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { churchInfo } from '@core/church-info';
import { LanguageService, TranslationKey } from '@services/language.service';

interface NavItem {
  labelKey: TranslationKey;
  path: string;
  children?: NavItem[];
  external?: boolean;
}

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [NgFor, NgIf, RouterLink, RouterLinkActive],
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.scss'
})
export class NavbarComponent {
  protected readonly church = churchInfo;
  protected readonly menuOpen = signal(false);
  protected readonly navItems: NavItem[] = [
    { labelKey: 'nav.home', path: '/' },
    {
      labelKey: 'nav.about',
      path: '/about',
      children: [
        { labelKey: 'nav.whoWeAre', path: '/about' },
        { labelKey: 'nav.staff', path: '/about/staff' },
        { labelKey: 'nav.bylaws', path: '/about/bylaws' }
      ]
    },
    {
      labelKey: 'nav.ministries',
      path: '/ministries',
      children: [
        { labelKey: 'nav.overview', path: '/ministries' },
        { labelKey: 'nav.mission', path: '/ministries/mission' },
        { labelKey: 'nav.men', path: '/ministries/men' },
        { labelKey: 'nav.women', path: '/ministries/women' },
        { labelKey: 'nav.khanglai', path: '/ministries/khanglai' },
        { labelKey: 'nav.children', path: '/ministries/children' }
      ]
    },
    { labelKey: 'nav.sermons', path: '/sermons' },
    { labelKey: 'nav.songbook', path: '/songbook' },
    { labelKey: 'nav.contact', path: '/contact' }
  ];

  constructor(protected readonly languageService: LanguageService) {}

  protected t(key: TranslationKey): string {
    return this.languageService.t(key);
  }

  protected toggleLanguage(): void {
    this.languageService.toggleLanguage();
  }

  protected toggleMenu(): void {
    this.menuOpen.update((open) => !open);
  }

  protected closeMenu(): void {
    this.menuOpen.set(false);
  }
}
