create table if not exists public.staff (
  id uuid primary key,
  name text not null,
  email text,
  phone text,
  website text,
  photo_url text,
  short_description text,
  bio text,
  slug text,
  wix_item_path text,
  wix_team_path text,
  wix_owner text,
  sort_order integer not null default 0,
  is_published boolean not null default true,
  source_created_at timestamptz,
  source_updated_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.staff_terms (
  id uuid primary key,
  staff_id uuid not null references public.staff(id) on delete cascade,
  role text not null,
  department text,
  bylaw text,
  term_start_year integer,
  term_end_year integer,
  is_current boolean not null default true,
  source text not null default 'wix',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists staff_is_published_sort_order_idx
  on public.staff (is_published, sort_order, name);

create index if not exists staff_terms_staff_id_idx
  on public.staff_terms (staff_id, is_current, term_start_year, term_end_year);

create unique index if not exists staff_terms_history_key_idx
  on public.staff_terms (
    staff_id,
    role,
    coalesce(department, ''),
    coalesce(term_start_year, 0),
    coalesce(term_end_year, 0)
  );

alter table public.staff enable row level security;
alter table public.staff_terms enable row level security;

drop policy if exists "Published staff are publicly readable" on public.staff;
create policy "Published staff are publicly readable"
  on public.staff
  for select
  using (is_published = true);

drop policy if exists "Published staff terms are publicly readable" on public.staff_terms;
create policy "Published staff terms are publicly readable"
  on public.staff_terms
  for select
  using (
    exists (
      select 1
      from public.staff
      where staff.id = staff_terms.staff_id
        and staff.is_published = true
    )
  );

grant usage on schema public to anon, authenticated, service_role;
grant select on public.staff to anon, authenticated;
grant select on public.staff_terms to anon, authenticated;
grant select, insert, update, delete on public.staff to service_role;
grant select, insert, update, delete on public.staff_terms to service_role;
