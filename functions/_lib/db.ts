export interface Env {
  DB: D1Database;
  META_GRAPH_API_VERSION?: string;
  MINISTRY_SOCIAL_CONFIG?: string;
}

export type SongRow = Record<string, unknown>;
export type StaffRow = Record<string, unknown> & {
  staff_terms?: StaffTermRow[];
};
export type StaffTermRow = Record<string, unknown>;

export function parseJsonArray(value: unknown): string[] {
  if (Array.isArray(value)) {
    return value.filter((item): item is string => typeof item === 'string');
  }

  if (typeof value !== 'string' || !value.trim()) {
    return [];
  }

  try {
    const parsed = JSON.parse(value);
    return Array.isArray(parsed) ? parsed.filter((item): item is string => typeof item === 'string') : [];
  } catch {
    return value
      .split(',')
      .map((item) => item.trim())
      .filter(Boolean);
  }
}

export function bool(value: unknown): boolean {
  return value === true || value === 1 || value === '1';
}

export async function fetchPublishedStaff(db: D1Database, id?: string): Promise<StaffRow[]> {
  const staffStatement = id
    ? db.prepare('select * from staff where id = ? and is_published = 1 order by sort_order, name').bind(id)
    : db.prepare('select * from staff where is_published = 1 order by sort_order, name');
  const staffRows = (await staffStatement.all<StaffRow>()).results ?? [];

  if (!staffRows.length) {
    return [];
  }

  const placeholders = staffRows.map(() => '?').join(',');
  const termRows =
    (
      await db
        .prepare(
          `select * from staff_terms where staff_id in (${placeholders}) order by "order", is_current desc, term_start_year desc`
        )
        .bind(...staffRows.map((row) => row.id))
        .all<StaffTermRow>()
    ).results ?? [];
  const termsByStaff = new Map<string, StaffTermRow[]>();

  for (const term of termRows) {
    const staffId = String(term.staff_id ?? '');
    const mapped = {
      ...term,
      departments: parseJsonArray(term.departments),
      is_current: bool(term.is_current)
    };
    termsByStaff.set(staffId, [...(termsByStaff.get(staffId) ?? []), mapped]);
  }

  return staffRows.map((row) => ({
    ...row,
    is_published: bool(row.is_published),
    staff_terms: termsByStaff.get(String(row.id)) ?? []
  }));
}
