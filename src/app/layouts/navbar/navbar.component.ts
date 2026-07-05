import { NgFor, NgIf } from '@angular/common';
import { Component, signal } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { churchInfo } from '@core/church-info';

interface NavItem {
  label: string;
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
    { label: 'Home', path: '/' },
    {
      label: 'About',
      path: '/about',
      children: [
        { label: 'Who We Are', path: '/about' },
        { label: 'Staff', path: '/about/staff' },
        { label: 'Bylaws', path: '/about/bylaws' }
      ]
    },
    {
      label: 'Ministries',
      path: '/ministries',
      children: [
        { label: 'Overview', path: '/ministries' },
        { label: 'Mission', path: '/ministries/mission' },
        { label: 'Men', path: '/ministries/men' },
        { label: 'Women', path: '/ministries/women' },
        { label: 'Khanglai', path: '/ministries/khanglai' },
        { label: 'Children', path: '/ministries/children' }
      ]
    },
    { label: 'Sermons', path: '/sermons' },
    { label: 'Songbook', path: '/songbook' },
    { label: 'Contact', path: '/contact' }
  ];

  protected toggleMenu(): void {
    this.menuOpen.update((open) => !open);
  }

  protected closeMenu(): void {
    this.menuOpen.set(false);
  }
}
