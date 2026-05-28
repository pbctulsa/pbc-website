import { NgFor, NgIf } from '@angular/common';
import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { StaffMember } from '@models/staff-member.model';
import { SupabaseService } from '@services/supabase.service';

@Component({
  selector: 'app-staff',
  standalone: true,
  imports: [FormsModule, NgFor, NgIf, RouterLink],
  templateUrl: './staff.component.html',
  styleUrl: './staff.component.scss'
})
export class StaffComponent implements OnInit {
  private readonly supabaseService = inject(SupabaseService);
  protected readonly isLoading = signal(true);
  protected readonly error = signal<string | null>(null);
  protected readonly staff = signal<StaffMember[]>(this.fallbackStaff());
  protected readonly departmentFilter = signal('All');
  protected readonly departmentOptions = computed(() => [
    'All',
    ...Array.from(
      new Set(
        this.staff()
          .flatMap((member) => member.departments ?? [])
          .filter(Boolean)
      )
    ).sort((left, right) => left.localeCompare(right))
  ]);
  protected readonly staffSections = computed(() => this.buildStaffSections(this.staff(), this.departmentFilter()));

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

  protected departmentLabels(member: StaffMember): string[] {
    return member.departments ?? [];
  }

  protected updateDepartmentFilter(value: string): void {
    this.departmentFilter.set(value);
  }

  private buildStaffSections(
    staff: StaffMember[],
    departmentFilter: string
  ): Array<{ title: string; members: StaffMember[] }> {
    const grouped = new Map<string, StaffMember[]>();
    const selectedDepartment = departmentFilter === 'All' ? null : departmentFilter;

    for (const member of staff) {
      const departments = member.departments ?? [];

      for (const department of departments) {
        if (selectedDepartment && department !== selectedDepartment) {
          continue;
        }

        const members = grouped.get(department) ?? [];
        members.push(member);
        grouped.set(department, members);
      }
    }

    if (!selectedDepartment && grouped.size === 0) {
      return [
        {
          title: 'All Staff',
          members: [...staff].sort((left, right) => this.compareStaff(left, right))
        }
      ];
    }

    if (selectedDepartment && !grouped.has(selectedDepartment)) {
      return [];
    }

    for (const members of grouped.values()) {
      members.sort((left, right) => this.compareStaff(left, right));
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

  private compareStaff(left: StaffMember, right: StaffMember): number {
    const leftOrder = left.order ?? Number.MAX_SAFE_INTEGER;
    const rightOrder = right.order ?? Number.MAX_SAFE_INTEGER;

    if (leftOrder !== rightOrder) {
      return leftOrder - rightOrder;
    }

    return left.name.localeCompare(right.name);
  }
}
