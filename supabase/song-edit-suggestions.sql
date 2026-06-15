create extension if not exists pgcrypto;

create table if not exists public.song_edit_suggestions (
  id uuid primary key default gen_random_uuid(),
  song_id text not null,
  song_title text not null,
  song_number integer,
  original_fields jsonb not null,
  suggested_fields jsonb not null,
  submitter_name text,
  submitter_email text,
  note text,
  status text not null default 'pending',
  reviewed_by text,
  reviewed_at timestamptz,
  review_note text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint song_edit_suggestions_status_check
    check (status in ('pending', 'approved', 'rejected'))
);

create index if not exists song_edit_suggestions_status_created_at_idx
  on public.song_edit_suggestions (status, created_at desc);

create index if not exists song_edit_suggestions_song_id_idx
  on public.song_edit_suggestions (song_id);

alter table public.song_edit_suggestions enable row level security;

drop policy if exists "Anyone can submit song edit suggestions" on public.song_edit_suggestions;
create policy "Anyone can submit song edit suggestions"
  on public.song_edit_suggestions
  for insert
  with check (
    status = 'pending'
    and reviewed_by is null
    and reviewed_at is null
    and review_note is null
  );

grant usage on schema public to anon, authenticated, service_role;
grant insert on public.song_edit_suggestions to anon, authenticated;
grant select, insert, update, delete on public.song_edit_suggestions to service_role;
