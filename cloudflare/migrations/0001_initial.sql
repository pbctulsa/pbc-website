create table if not exists songs (
  id text primary key,
  title text not null,
  song_number integer,
  number integer,
  author text,
  artist text,
  writer text,
  composer text,
  category text,
  book text,
  song_type text,
  type text,
  lyrics_text text,
  lyrics text,
  lyrics_html text,
  song_key text,
  "key" text,
  source text,
  is_published integer not null default 1,
  created_at text not null default current_timestamp,
  updated_at text not null default current_timestamp
);

create index if not exists songs_published_number_title_idx
  on songs (is_published, song_number, number, title);

create table if not exists staff (
  id text primary key default (lower(hex(randomblob(16)))),
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
  is_published integer not null default 1,
  source_created_at text,
  source_updated_at text,
  created_at text not null default current_timestamp,
  updated_at text not null default current_timestamp
);

create table if not exists staff_terms (
  id text primary key default (lower(hex(randomblob(16)))),
  staff_id text not null references staff(id) on delete cascade,
  role text not null,
  department text,
  departments text,
  bylaw text,
  "order" integer not null default 0,
  term_start_year integer,
  term_end_year integer,
  is_current integer not null default 1,
  source text not null default 'wix',
  created_at text not null default current_timestamp,
  updated_at text not null default current_timestamp
);

create index if not exists staff_is_published_sort_order_idx
  on staff (is_published, sort_order, name);

create index if not exists staff_terms_staff_id_idx
  on staff_terms (staff_id, "order", is_current, term_start_year, term_end_year);

create unique index if not exists staff_terms_history_key_idx
  on staff_terms (
    staff_id,
    role,
    ifnull(department, ''),
    ifnull(term_start_year, 0),
    ifnull(term_end_year, 0)
  );

create table if not exists song_edit_suggestions (
  id text primary key default (lower(hex(randomblob(16)))),
  song_id text not null,
  song_title text not null,
  song_number integer,
  original_fields text not null,
  suggested_fields text not null,
  submitter_name text,
  submitter_email text,
  note text,
  status text not null default 'pending' check (status in ('pending', 'approved', 'rejected')),
  reviewed_by text,
  reviewed_at text,
  review_note text,
  created_at text not null default current_timestamp,
  updated_at text not null default current_timestamp
);

create index if not exists song_edit_suggestions_status_created_at_idx
  on song_edit_suggestions (status, created_at desc);

create index if not exists song_edit_suggestions_song_id_idx
  on song_edit_suggestions (song_id);
