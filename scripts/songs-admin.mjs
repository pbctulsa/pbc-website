import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'node:fs';

loadDotenv();

const url = process.env.SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const table = process.env.SUPABASE_SONGS_TABLE || 'songs';

if (!url || !serviceRoleKey) {
  fail('Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env');
}

if (!serviceRoleKey.includes('.') || serviceRoleKey.split('.').length !== 3) {
  fail('SUPABASE_SERVICE_ROLE_KEY does not look like a valid JWT.');
}

const supabase = createClient(url, serviceRoleKey, {
  auth: {
    persistSession: false,
    autoRefreshToken: false
  }
});

const [command, ...args] = process.argv.slice(2);

switch (command) {
  case 'count':
    await countSongs();
    break;
  case 'sample':
    await sampleSongs(Number(args[0] || 5));
    break;
  case 'set-published':
    await setPublished(args[0], args[1]);
    break;
  case 'update':
    await updateSong(args[0], args.slice(1).join(' '));
    break;
  case 'format-lyrics':
    await formatLyrics(args[0], args.includes('--write'));
    break;
  default:
    printUsage();
    process.exit(command ? 1 : 0);
}

async function countSongs() {
  const { count, error } = await supabase
    .from(table)
    .select('id', { count: 'exact', head: true });

  if (error) {
    fail(formatSupabaseError(error));
  }

  console.log(`${count ?? 0} rows in ${table}`);
}

async function sampleSongs(limit) {
  const { data, error } = await supabase
    .from(table)
    .select('id,title,song_number,book,is_published')
    .order('song_number', { ascending: true })
    .limit(limit);

  if (error) {
    fail(formatSupabaseError(error));
  }

  console.table(data ?? []);
}

async function setPublished(id, rawValue) {
  if (!id || !['true', 'false'].includes(rawValue)) {
    fail('Usage: npm run songs:admin -- set-published <song-id> <true|false>');
  }

  const { data, error } = await supabase
    .from(table)
    .update({ is_published: rawValue === 'true' })
    .eq('id', id)
    .select('id,title,is_published')
    .single();

  if (error) {
    fail(formatSupabaseError(error));
  }

  console.table([data]);
}

async function updateSong(id, jsonPatch) {
  if (!id || !jsonPatch) {
    fail('Usage: npm run songs:admin -- update <song-id> \'{"title":"New Title"}\'');
  }

  let patch;
  try {
    patch = JSON.parse(jsonPatch);
  } catch {
    fail('Update payload must be valid JSON.');
  }

  const { data, error } = await supabase
    .from(table)
    .update(patch)
    .eq('id', id)
    .select('*')
    .single();

  if (error) {
    fail(formatSupabaseError(error));
  }

  console.log(JSON.stringify(data, null, 2));
}

async function formatLyrics(id, shouldWrite) {
  if (!id) {
    fail('Usage: npm run songs:admin -- format-lyrics <song-id> [--write]');
  }

  const { data, error } = await supabase
    .from(table)
    .select('id,title,lyrics_text,song_key')
    .eq('id', id)
    .single();

  if (error) {
    fail(formatSupabaseError(error));
  }

  const formatted = formatForProPresenter(data.title, data.lyrics_text || '');

  if (!shouldWrite) {
    console.log(`# ${data.title}`);
    console.log('');
    console.log(formatted);
    console.log('');
    console.log('Dry run only. Add --write to update lyrics_text in Supabase.');
    return;
  }

  const { data: updated, error: updateError } = await supabase
    .from(table)
    .update({ lyrics_text: formatted })
    .eq('id', id)
    .select('id,title')
    .single();

  if (updateError) {
    fail(formatSupabaseError(updateError));
  }

  console.log(`Updated lyrics_text for ${updated.title}`);
}

function formatForProPresenter(title, rawLyrics) {
  const metadataPattern = /^(doh\s+is|key\s*:|bpm\s*:|ccli\s*:)/i;
  const titleText = normalizeSongTitle(title);
  const metadata = [];
  const lyricLines = [];
  const rawLines = rawLyrics
    .replace(/\r\n?/g, '\n')
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean);

  for (const line of rawLines) {
    if (metadataPattern.test(line)) {
      metadata.push(line);
      continue;
    }

    lyricLines.push(line);
  }

  const sections = [];
  let current = null;

  for (const line of lyricLines) {
    const verseMatch = line.match(/^(\d+)[.)]\s*(.*)$/);

    if (verseMatch) {
      current = {
        label: `Verse ${verseMatch[1]}`,
        lines: []
      };
      sections.push(current);

      if (verseMatch[2]) {
        current.lines.push(verseMatch[2]);
      }

      continue;
    }

    if (!current) {
      current = {
        label: 'Verse 1',
        lines: []
      };
      sections.push(current);
    }

    current.lines.push(line);
  }

  const normalizedSections = [];

  for (const section of sections) {
    if (section.lines.length <= 4) {
      normalizedSections.push(section);
      continue;
    }

    for (let index = 0; index < section.lines.length; index += 4) {
      const chunk = section.lines.slice(index, index + 4);
      const label = section.label === 'Verse 1' && index > 0 ? 'Chorus' : section.label;

      normalizedSections.push({
        label,
        lines: chunk
      });
    }
  }

  const header = [titleText, ...metadata].filter(Boolean).join('\n');
  const body = normalizedSections
    .map((section) => [section.label, ...section.lines].join('\n'))
    .join('\n\n');

  return [header, body].filter(Boolean).join('\n\n');
}

function normalizeSongTitle(title) {
  return String(title || '')
    .replace(/^\s*\d+[.)]?\s*/, '')
    .trim()
    .toUpperCase();
}

function loadDotenv() {
  let contents = '';

  try {
    contents = readFileSync('.env', 'utf8');
  } catch {
    return;
  }

  for (const line of contents.split('\n')) {
    const trimmed = line.trim();

    if (!trimmed || trimmed.startsWith('#')) {
      continue;
    }

    const index = trimmed.indexOf('=');

    if (index === -1) {
      continue;
    }

    const key = trimmed.slice(0, index).trim();
    const value = trimmed.slice(index + 1).trim().replace(/^['"]|['"]$/g, '');

    if (!process.env[key]) {
      process.env[key] = value;
    }
  }
}

function printUsage() {
  console.log(`
Usage:
  npm run songs:admin -- count
  npm run songs:admin -- sample 10
  npm run songs:admin -- set-published <song-id> true
  npm run songs:admin -- update <song-id> '{"title":"New Title"}'
  npm run songs:admin -- format-lyrics <song-id>
  npm run songs:admin -- format-lyrics <song-id> --write
`);
}

function formatSupabaseError(error) {
  if (error.message) {
    return error.message;
  }

  const details = {
    code: error.code,
    details: error.details,
    hint: error.hint
  };

  return `Supabase request failed: ${JSON.stringify(details)}`;
}

function fail(message) {
  console.error(message);
  process.exit(1);
}
