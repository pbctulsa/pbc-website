import { NgFor, NgIf } from '@angular/common';
import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { StaffMember } from '@models/staff-member.model';
import { SupabaseService } from '@services/supabase.service';

@Component({
  selector: 'app-staff',
  standalone: true,
  imports: [NgFor, NgIf, RouterLink],
  templateUrl: './staff.component.html',
  styleUrl: './staff.component.scss'
})
export class StaffComponent implements OnInit {
  private readonly supabaseService = inject(SupabaseService);
  protected readonly isLoading = signal(true);
  protected readonly error = signal<string | null>(null);
  protected readonly staff = signal<StaffMember[]>(this.fallbackStaff());
  protected readonly staffSections = computed(() => this.buildStaffSections(this.staff()));

  async ngOnInit(): Promise<void> {
    try {
      const staff = await this.supabaseService.getStaff();

      if (staff.length) {
        this.staff.set(staff);
      }
    } catch (error) {
      this.error.set('Showing local staff data until Supabase staff migration is complete.');
      console.error(error);
    } finally {
      this.isLoading.set(false);
    }
  }

  private fallbackStaff(): StaffMember[] {
    return [
    {
      id: 'pastor',
      name: 'Rev. Dr. Seikam Touthang',
      role: 'Senior Pastor & Moderator',
      department: 'Church Executive',
      email: 'sktouthang@pbctulsa.org'
    },
    {
      id: 'assistant-pastor',
      name: 'Rev. Onkhomang Touthang',
      role: 'Assistant Pastor',
      department: 'Church Executive',
      email: 'oktouthang@pbctulsa.org'
    },
    {
      id: 'mission-chair',
      name: 'Rev. Zamkhokhai Touthang',
      role: 'Mission Chairman',
      department: 'Church Executive',
      email: 'zamkhokhaitouthang@gmail.com',
      termStartYear: 2025,
      termEndYear: 2027
    },
    {
      id: 'men-chair',
      name: 'Ngamkhothang Haokip',
      role: 'Men Chairman',
      department: 'Church Executive',
      email: 'enkaytikip@gmail.com',
      termStartYear: 2025,
      termEndYear: 2027
    },
    {
      id: 'women-chair',
      name: 'Lheineichong Mate Touthang',
      role: 'Women Chairperson',
      department: 'Church Executive',
      termStartYear: 2025,
      termEndYear: 2027
    },
    {
      id: 'youth-chair',
      name: 'Lic. Ps. Khaiminlen Doungel',
      role: 'Youth Chairman',
      department: 'Church Executive',
      termStartYear: 2025,
      termEndYear: 2027
    },
    {
      id: 'christian-education',
      name: 'Rev. Nehminthang Touthang',
      role: 'Christian Education Minister',
      department: 'Church Executive',
      email: 'nhtouthang@pbctulsa.org'
    },
    {
      id: 'finance-secretary',
      name: 'Shominlun Lhungdim',
      role: 'Finance Secretary',
      department: 'Church Executive',
      email: 'slhungdim@pbctulsa.org'
    },
    {
      id: 'media-director',
      name: 'James Touthang',
      role: 'Technical & Media Director',
      department: 'Individual Positions',
      email: 'jtouthang@pbctulsa.org'
    }
    ];
  }

  protected readonly rotatingLeaders = computed(() =>
    this.staff().filter((member) => member.termStartYear && member.termEndYear)
  );

  protected termLabel(member: StaffMember): string {
    if (!member.termStartYear || !member.termEndYear) {
      return 'Ongoing';
    }

    return `${member.termStartYear}-${member.termEndYear}`;
  }

  protected phoneHref(phone: string): string {
    const digits = phone.replace(/[^+\d]/g, '');
    return `tel:${digits || phone}`;
  }

  private buildStaffSections(staff: StaffMember[]): Array<{ title: string; members: StaffMember[] }> {
    const grouped = new Map<string, StaffMember[]>();

    for (const member of staff) {
      const department = this.normalizeDepartment(member.department);
      const members = grouped.get(department) ?? [];
      members.push(member);
      grouped.set(department, members);
    }

    const executive = grouped.get('Church Executive') ?? [];
    const otherDepartments = [...grouped.entries()]
      .filter(([department]) => department !== 'Church Executive')
      .sort(([left], [right]) => left.localeCompare(right))
      .map(([title, members]) => ({ title, members }));

    const sections: Array<{ title: string; members: StaffMember[] }> = [];

    if (executive.length) {
      sections.push({ title: 'Church Executive', members: executive });
    }

    sections.push(...otherDepartments);
    return sections;
  }

  private normalizeDepartment(department?: string): string {
    const value = department?.trim();
    return value ? value : 'Other Ministries';
  }
}
