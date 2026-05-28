import { NgFor, NgIf } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { StaffMember, StaffTerm } from '@models/staff-member.model';
import { SupabaseService } from '@services/supabase.service';

@Component({
  selector: 'app-staff-detail',
  standalone: true,
  imports: [NgFor, NgIf, RouterLink],
  templateUrl: './staff-detail.component.html',
  styleUrl: './staff-detail.component.scss'
})
export class StaffDetailComponent {
  private readonly route = inject(ActivatedRoute);
  private readonly supabaseService = inject(SupabaseService);

  protected readonly staff = signal<StaffMember | null>(null);
  protected readonly errorMessage = signal('');
  protected readonly isLoading = signal(true);

  constructor() {
    void this.loadStaff();
  }

  protected termLabel(term: StaffTerm): string {
    const order = term.order ? `Order ${term.order}` : '';

    if (!term.termStartYear || !term.termEndYear) {
      return order || (term.isCurrent ? 'Current' : 'Ongoing');
    }

    return order ? `${order} • ${term.termStartYear}-${term.termEndYear}` : `${term.termStartYear}-${term.termEndYear}`;
  }

  protected phoneHref(phone: string): string {
    const digits = phone.replace(/[^+\d]/g, '');
    return `tel:${digits || phone}`;
  }

  private async loadStaff(): Promise<void> {
    const id = this.route.snapshot.paramMap.get('id');

    if (!id) {
      this.errorMessage.set('Staff profile not found.');
      this.isLoading.set(false);
      return;
    }

    try {
      const staff = await this.supabaseService.getStaffById(id);
      this.staff.set(staff);

      if (!staff) {
        this.errorMessage.set('Staff profile not found.');
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unable to load this staff profile from Supabase.';
      this.errorMessage.set(message);
    } finally {
      this.isLoading.set(false);
    }
  }
}
