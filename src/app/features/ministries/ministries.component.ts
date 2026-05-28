import { NgFor, NgIf } from '@angular/common';
import { Component, computed, inject } from '@angular/core';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { map } from 'rxjs';
import { getMinistryBySlug, ministries } from '@core/ministries';

@Component({
  selector: 'app-ministries',
  standalone: true,
  imports: [NgFor, NgIf, RouterLink],
  templateUrl: './ministries.component.html',
  styleUrl: './ministries.component.scss'
})
export class MinistriesComponent {
  private readonly route = inject(ActivatedRoute);
  private readonly sanitizer = inject(DomSanitizer);

  protected readonly ministries = ministries;
  protected readonly slug = toSignal(
    this.route.paramMap.pipe(map((params) => params.get('slug'))),
    { initialValue: null }
  );
  protected readonly selectedMinistry = computed(() => getMinistryBySlug(this.slug()));
  protected readonly isInvalidSlug = computed(() => this.slug() !== null && !this.selectedMinistry());

  protected facebookPluginUrl(pageUrl: string): SafeResourceUrl {
    const url = new URL('https://www.facebook.com/plugins/page.php');
    url.searchParams.set('href', pageUrl);
    url.searchParams.set('tabs', 'timeline');
    url.searchParams.set('width', '500');
    url.searchParams.set('height', '700');
    url.searchParams.set('small_header', 'false');
    url.searchParams.set('adapt_container_width', 'true');
    url.searchParams.set('hide_cover', 'false');
    url.searchParams.set('show_facepile', 'true');
    return this.sanitizer.bypassSecurityTrustResourceUrl(url.toString());
  }

  protected selectMinistryPath(slug: string): string {
    return `/ministries/${slug}`;
  }
}
