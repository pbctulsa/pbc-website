import { NgFor, NgIf } from '@angular/common';
import { Component, computed, inject } from '@angular/core';
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

  protected readonly ministries = ministries;
  protected readonly slug = toSignal(
    this.route.paramMap.pipe(map((params) => params.get('slug'))),
    { initialValue: null }
  );
  protected readonly selectedMinistry = computed(() => getMinistryBySlug(this.slug()));
  protected readonly isInvalidSlug = computed(() => this.slug() !== null && !this.selectedMinistry());

  protected selectMinistryPath(slug: string): string {
    return `/ministries/${slug}`;
  }
}
