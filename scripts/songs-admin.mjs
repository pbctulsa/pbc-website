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
