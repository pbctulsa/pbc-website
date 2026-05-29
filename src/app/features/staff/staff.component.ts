import { NgFor, NgIf } from '@angular/common';
import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { StaffMember } from '@models/staff-member.model';
import { SupabaseService } from '@services/supabase.service';
import { map } from 'rxjs';

@Component({
  selector: 'app-staff',
  standalone: true,
  imports: [FormsModule, NgFor, NgIf, RouterLink],
  templateUrl: './staff.component.html',
  styleUrl: './staff.component.scss'
})
export class StaffComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly supabaseService = inject(SupabaseService);
  protected readonly isLoading = signal(true);
  protected readonly error = signal<string | null>(null);
  protected readonly staff = signal<StaffMember[]>(this.fallbackStaff());
  protected readonly departmentFilter = signal('All');
  protected readonly showPastTerms = toSignal(
    this.route.queryParamMap.pipe(map((params) => params.get('past') === '1')),
    { initialValue: false }
  );
  protected readonly currentStaff = computed(() =>
    this.staff().filter((member) => this.isCurrentMember(member))
  );
  protected readonly pastStaff = computed(() =>
    this.staff().filter((member) => this.isPastMember(member))
  );
  protected readonly visibleStaff = computed(() =>
    this.showPastTerms() ? this.pastStaff() : this.currentStaff()
  );
  protected readonly departmentOptions = computed(() => [
    'All',
    ...Array.from(
      new Set(
        this.visibleStaff()
          .flatMap((member) => this.departmentLabels(member))
          .filter(Boolean)
      )
    ).sort((left, right) => left.localeCompare(right))
  ]);
  protected readonly staffSections = computed(() => this.buildStaffSections(this.visibleStaff(), this.departmentFilter()));

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
      departments: ['Church Executive'],
      email: 'sktouthang@pbctulsa.org',
      terms: [
        {
          role: 'Senior Pastor & Moderator',
          departments: ['Church Executive'],
          isCurrent: true
        }
      ]
    },
    {
      id: 'assistant-pastor',
      name: 'Rev. Onkhomang Touthang',
      role: 'Assistant Pastor',
      department: 'Church Executive',
      departments: ['Church Executive'],
      email: 'oktouthang@pbctulsa.org',
      terms: [
        {
          role: 'Assistant Pastor',
          departments: ['Church Executive'],
          isCurrent: true
        }
      ]
    },
    {
      id: 'mission-chair',
      name: 'Rev. Zamkhokhai Touthang',
      role: 'Mission Chairman',
      department: 'Church Executive',
      departments: ['Church Executive'],
      email: 'zamkhokhaitouthang@gmail.com',
      termStartYear: 2025,
      termEndYear: 2027,
      terms: [
        {
          role: 'Mission Chairman',
          departments: ['Church Executive'],
          termStartYear: 2025,
          termEndYear: 2027,
          isCurrent: true
        }
      ]
    },
    {
      id: 'men-chair',
      name: 'Ngamkhothang Haokip',
      role: 'Men Chairman',
      department: 'Church Executive',
      departments: ['Church Executive'],
      email: 'enkaytikip@gmail.com',
      termStartYear: 2025,
      termEndYear: 2027,
      terms: [
        {
          role: 'Men Chairman',
          departments: ['Church Executive'],
          termStartYear: 2025,
          termEndYear: 2027,
          isCurrent: true
        }
      ]
    },
    {
      id: 'women-chair',
      name: 'Lheineichong Mate Touthang',
      role: 'Women Chairperson',
      department: 'Church Executive',
      departments: ['Church Executive'],
      termStartYear: 2025,
      termEndYear: 2027,
      terms: [
        {
          role: 'Women Chairperson',
          departments: ['Church Executive'],
          termStartYear: 2025,
          termEndYear: 2027,
          isCurrent: true
        }
      ]
    },
    {
      id: 'youth-chair',
      name: 'Lic. Ps. Khaiminlen Doungel',
      role: 'Youth Chairman',
      department: 'Church Executive',
      departments: ['Church Executive'],
      termStartYear: 2025,
      termEndYear: 2027,
      terms: [
        {
          role: 'Youth Chairman',
          departments: ['Church Executive'],
          termStartYear: 2025,
          termEndYear: 2027,
          isCurrent: true
        }
      ]
    },
    {
      id: 'christian-education',
      name: 'Rev. Nehminthang Touthang',
      role: 'Christian Education Minister',
      department: 'Church Executive',
      departments: ['Church Executive'],
      email: 'nhtouthang@pbctulsa.org',
      terms: [
        {
          role: 'Christian Education Minister',
          departments: ['Church Executive'],
          isCurrent: true
        }
      ]
    },
    {
      id: 'finance-secretary',
      name: 'Shominlun Lhungdim',
      role: 'Finance Secretary',
      department: 'Church Executive',
      departments: ['Church Executive'],
      email: 'slhungdim@pbctulsa.org',
      terms: [
        {
          role: 'Finance Secretary',
          departments: ['Church Executive'],
          isCurrent: true
        }
      ]
    },
    {
      id: 'media-director',
      name: 'James Touthang',
      role: 'Technical & Media Director',
      department: 'Individual Positions',
      departments: ['Individual Positions'],
      email: 'jtouthang@pbctulsa.org',
      terms: [
        {
          role: 'Technical & Media Director',
          departments: ['Individual Positions'],
          isCurrent: true
        }
      ]
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
          title: this.showPastTerms() ? 'Previous Staff' : 'All Staff',
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

  private isCurrentMember(member: StaffMember): boolean {
    return member.terms?.some((term) => term.isCurrent) ?? false;
  }

  private isPastMember(member: StaffMember): boolean {
    const terms = member.terms ?? [];

    if (!terms.length) {
      return false;
    }

    return terms.some((term) => term.isCurrent === false) && !terms.some((term) => term.isCurrent);
  }
}
