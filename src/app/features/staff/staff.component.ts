import { NgFor, NgIf } from '@angular/common';
import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { StaffMember, StaffTerm } from '@models/staff-member.model';
import { CloudflareDataService } from '@services/cloudflare-data.service';
import { LanguageService, TranslationKey } from '@services/language.service';
import { map } from 'rxjs';

interface StaffListingEntry {
  key: string;
  member: StaffMember;
  role: string;
  departments: string[];
  term: StaffTerm;
}

@Component({
  selector: 'app-staff',
  standalone: true,
  imports: [FormsModule, NgFor, NgIf, RouterLink],
  templateUrl: './staff.component.html',
  styleUrl: './staff.component.scss'
})
export class StaffComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly dataService = inject(CloudflareDataService);
  private readonly languageService = inject(LanguageService);
  protected readonly isLoading = signal(true);
  protected readonly error = signal<string | null>(null);
  protected readonly staff = signal<StaffMember[]>(this.fallbackStaff());
  protected readonly departmentFilter = signal('All');
  protected readonly showPastTerms = toSignal(
    this.route.queryParamMap.pipe(map((params) => params.get('past') === '1')),
    { initialValue: false }
  );
  protected readonly currentEntries = computed(() =>
    this.buildEntries(this.staff(), true)
  );
  protected readonly pastEntries = computed(() =>
    this.buildEntries(this.staff(), false)
  );
  protected readonly visibleEntries = computed(() =>
    this.showPastTerms() ? this.pastEntries() : this.currentEntries()
  );
  protected readonly departmentOptions = computed(() => [
    'All',
    ...Array.from(
      new Set(
        this.visibleEntries()
          .flatMap((entry) => this.departmentLabels(entry))
          .filter(Boolean)
      )
    ).sort((left, right) => left.localeCompare(right))
  ]);
  protected readonly staffSections = computed(() => this.buildStaffSections(this.visibleEntries(), this.departmentFilter()));

  async ngOnInit(): Promise<void> {
    try {
      const staff = await this.dataService.getStaff();

      if (staff.length) {
        this.staff.set(staff);
      }
    } catch (error) {
      this.error.set(this.t('staff.fallbackMessage'));
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

  protected departmentLabels(entry: { departments?: string[] }): string[] {
    return entry.departments ?? [];
  }

  protected updateDepartmentFilter(value: string): void {
    this.departmentFilter.set(value);
  }

  protected t(key: TranslationKey): string {
    return this.languageService.t(key);
  }

  protected departmentLabel(value: string): string {
    switch (value) {
      case 'All':
        return this.t('staff.allDepartments');
      case 'Church Executive':
        return this.t('staff.churchExecutive');
      default:
        return value;
    }
  }

  protected trackByEntry(_index: number, entry: StaffListingEntry): string {
    return entry.key;
  }

  private buildStaffSections(
    entries: StaffListingEntry[],
    departmentFilter: string
  ): Array<{ title: string; entries: StaffListingEntry[] }> {
    const grouped = new Map<string, StaffListingEntry[]>();
    const selectedDepartment = departmentFilter === 'All' ? null : departmentFilter;

    for (const entry of entries) {
      const departments = entry.departments ?? [];

      for (const department of departments) {
        if (selectedDepartment && department !== selectedDepartment) {
          continue;
        }

        const groupedEntries = grouped.get(department) ?? [];
        groupedEntries.push(entry);
        grouped.set(department, groupedEntries);
      }
    }

    if (!selectedDepartment && grouped.size === 0) {
      return [
        {
          title: this.showPastTerms() ? this.t('staff.previousStaff') : this.t('staff.allStaff'),
          entries: [...entries].sort((left, right) => this.compareEntry(left, right))
        }
      ];
    }

    if (selectedDepartment && !grouped.has(selectedDepartment)) {
      return [];
    }

    for (const groupedEntries of grouped.values()) {
      groupedEntries.sort((left, right) => this.compareEntry(left, right));
    }

    const executive = grouped.get('Church Executive') ?? [];
    const otherDepartments = [...grouped.entries()]
      .filter(([department]) => department !== 'Church Executive')
      .sort(([left], [right]) => left.localeCompare(right))
      .map(([title, entries]) => ({ title, entries }));

    const sections: Array<{ title: string; entries: StaffListingEntry[] }> = [];

    if (executive.length) {
      sections.push({ title: this.t('staff.churchExecutive'), entries: executive });
    }

    sections.push(...otherDepartments);
    return sections;
  }

  private compareEntry(left: StaffListingEntry, right: StaffListingEntry): number {
    const leftOrder = left.term.order ?? Number.MAX_SAFE_INTEGER;
    const rightOrder = right.term.order ?? Number.MAX_SAFE_INTEGER;

    if (leftOrder !== rightOrder) {
      return leftOrder - rightOrder;
    }

    const roleComparison = left.role.localeCompare(right.role);

    if (roleComparison !== 0) {
      return roleComparison;
    }

    return left.member.name.localeCompare(right.member.name);
  }

  private buildEntries(staff: StaffMember[], current: boolean): StaffListingEntry[] {
    return staff.flatMap((member) => {
      const terms = (member.terms ?? []).filter((term) => (current ? term.isCurrent === true : term.isCurrent === false));

      if (!terms.length) {
        return [];
      }

      return terms.map((term, index) => ({
        key: `${member.id}:${current ? 'current' : 'past'}:${index}:${term.role}`,
        member,
        role: term.role || member.role,
        departments: term.departments?.length ? term.departments : member.departments ?? [],
        term
      }));
    });
  }
}
