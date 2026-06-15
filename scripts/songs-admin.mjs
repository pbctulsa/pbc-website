import { createClient } from '@supabase/supabase-js';
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';

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
  case 'format-numbered-verses':
    await formatNumberedVerses(args.includes('--write'));
    break;
  case 'split-verse-one-chorus':
    await splitVerseOneChorus(args.find((arg) => arg !== '--write'), args.includes('--write'));
    break;
  case 'restore-lyrics-backup':
    await restoreLyricsBackup(args[0], args.includes('--write'));
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

async function formatNumberedVerses(shouldWrite) {
  const rows = await fetchAllSongsForLyricsFormatting();
  const changedRows = rows
    .map((row) => ({
      ...row,
      formattedLyricsText: formatNumberedVerseLabels(row.lyrics_text || '')
    }))
    .filter((row) => row.formattedLyricsText !== (row.lyrics_text || '').replace(/\r\n?/g, '\n').trim());

  console.log(`${changedRows.length}/${rows.length} songs have numbered verse labels to format.`);

  if (!changedRows.length) {
    return;
  }

  console.log('\nPreview of first changed song:\n');
  console.log(`# ${changedRows[0].title}`);
  console.log('');
  console.log(changedRows[0].formattedLyricsText.slice(0, 1200));

  if (!shouldWrite) {
    console.log('\nDry run only. Add --write to update lyrics_text in Supabase.');
    return;
  }

  const backupPath = writeLyricsBackup(changedRows, 'numbered-verses');
  console.log(`\nBackup written to ${backupPath}`);

  for (let index = 0; index < changedRows.length; index += 1) {
    const row = changedRows[index];
    const { error } = await supabase
      .from(table)
      .update({ lyrics_text: row.formattedLyricsText })
      .eq('id', row.id);

    if (error) {
      fail(`Stopped at ${index + 1}/${changedRows.length} (${row.id}): ${formatSupabaseError(error)}`);
    }

    if ((index + 1) % 50 === 0 || index + 1 === changedRows.length) {
      console.log(`Updated ${index + 1}/${changedRows.length}`);
    }
  }

  console.log(`Formatted numbered verses for ${changedRows.length} songs.`);
}

async function splitVerseOneChorus(scopePath, shouldWrite) {
  const scopedIds = scopePath ? readBackupIds(scopePath) : null;
  const rows = await fetchAllSongsForLyricsFormatting();
  const scopedRows = scopedIds ? rows.filter((row) => scopedIds.has(row.id)) : rows;
  const changedRows = scopedRows
    .map((row) => ({
      ...row,
      formattedLyricsText: splitVerseOneEightLineChorus(row.lyrics_text || '')
    }))
    .filter((row) => row.formattedLyricsText !== (row.lyrics_text || '').replace(/\r\n?/g, '\n').trim());

  const scopeText = scopedIds ? ` scoped from ${scopePath}` : '';
  console.log(`${changedRows.length}/${scopedRows.length} songs${scopeText} have an 8-line Verse 1 to split.`);

  if (!changedRows.length) {
    return;
  }

  console.log('\nPreview of first changed song:\n');
  console.log(`# ${changedRows[0].title}`);
  console.log('');
  console.log(changedRows[0].formattedLyricsText.slice(0, 1400));

  if (!shouldWrite) {
    console.log('\nDry run only. Add --write to update lyrics_text in Supabase.');
    return;
  }

  const backupPath = writeLyricsBackup(changedRows, 'verse-one-chorus');
  console.log(`\nBackup written to ${backupPath}`);

  for (let index = 0; index < changedRows.length; index += 1) {
    const row = changedRows[index];
    const { error } = await supabase
      .from(table)
      .update({ lyrics_text: row.formattedLyricsText })
      .eq('id', row.id);

    if (error) {
      fail(`Stopped at ${index + 1}/${changedRows.length} (${row.id}): ${formatSupabaseError(error)}`);
    }

    if ((index + 1) % 50 === 0 || index + 1 === changedRows.length) {
      console.log(`Updated ${index + 1}/${changedRows.length}`);
    }
  }

  console.log(`Split Verse 1 choruses for ${changedRows.length} songs.`);
}

async function restoreLyricsBackup(path, shouldWrite) {
  if (!path) {
    fail('Usage: npm run songs:admin -- restore-lyrics-backup <backup-path> [--write]');
  }

  let rows;
  try {
    rows = JSON.parse(readFileSync(path, 'utf8'));
  } catch (error) {
    fail(`Could not read backup file: ${error.message}`);
  }

  const restoreRows = rows.filter((row) => row.id && typeof row.oldLyricsText === 'string');
  console.log(`${restoreRows.length} rows available to restore from ${path}`);

  if (!shouldWrite) {
    console.log('\nPreview of first restored row:\n');
    console.log(`# ${restoreRows[0]?.title || 'Unknown song'}`);
    console.log('');
    console.log((restoreRows[0]?.oldLyricsText || '').slice(0, 1000));
    console.log('\nDry run only. Add --write to restore lyrics_text in Supabase.');
    return;
  }

  for (let index = 0; index < restoreRows.length; index += 1) {
    const row = restoreRows[index];
    const { error } = await supabase
      .from(table)
      .update({ lyrics_text: row.oldLyricsText })
      .eq('id', row.id);

    if (error) {
      fail(`Stopped at ${index + 1}/${restoreRows.length} (${row.id}): ${formatSupabaseError(error)}`);
    }

    if ((index + 1) % 50 === 0 || index + 1 === restoreRows.length) {
      console.log(`Restored ${index + 1}/${restoreRows.length}`);
    }
  }

  console.log(`Restored lyrics_text for ${restoreRows.length} songs.`);
}

async function fetchAllSongsForLyricsFormatting() {
  const pageSize = 1000;
  const rows = [];
  let page = 0;

  while (true) {
    const from = page * pageSize;
    const to = from + pageSize - 1;
    const { data, error } = await supabase
      .from(table)
      .select('id,title,lyrics_text')
      .range(from, to);

    if (error) {
      fail(formatSupabaseError(error));
    }

    rows.push(...(data ?? []));

    if (!data || data.length < pageSize) {
      break;
    }

    page += 1;
  }

  return rows;
}

function formatNumberedVerseLabels(rawLyrics) {
  const normalizedLyrics = rawLyrics.replace(/\r\n?/g, '\n').trim();

  if (!normalizedLyrics) {
    return normalizedLyrics;
  }

  const headerLines = [];
  const sections = [];
  let currentSection = null;
  let changed = false;

  for (const line of normalizedLyrics.split('\n')) {
    const trimmed = line.trim();
    const verseMatch = trimmed.match(/^(\d+)[.)]\s*(.*)$/);

    if (verseMatch) {
      changed = true;
      currentSection = {
        label: `Verse ${verseMatch[1]}`,
        lines: []
      };
      sections.push(currentSection);

      if (verseMatch[2].trim()) {
        currentSection.lines.push(verseMatch[2].trim());
      }

      continue;
    }

    if (!trimmed) {
      continue;
    }

    if (currentSection) {
      currentSection.lines.push(trimmed);
      continue;
    }

    headerLines.push(trimmed);
  }

  if (!changed) {
    return normalizedLyrics;
  }

  const parts = [];

  if (headerLines.length) {
    parts.push(headerLines.join('\n'));
  }

  parts.push(
    ...sections.map((section) => [section.label, ...section.lines].join('\n'))
  );

  return parts.join('\n\n');
}

function splitVerseOneEightLineChorus(rawLyrics) {
  const normalizedLyrics = rawLyrics.replace(/\r\n?/g, '\n').trim();

  if (!normalizedLyrics) {
    return normalizedLyrics;
  }

  const headerLines = [];
  const sections = [];
  let currentSection = null;

  for (const line of normalizedLyrics.split('\n')) {
    const trimmed = line.trim();
    const labelMatch = trimmed.match(/^(Verse\s+\d+|Chorus)$/i);

    if (labelMatch) {
      currentSection = {
        label: normalizeSectionLabel(labelMatch[1]),
        lines: []
      };
      sections.push(currentSection);
      continue;
    }

    if (!trimmed) {
      continue;
    }

    if (currentSection) {
      currentSection.lines.push(trimmed);
      continue;
    }

    headerLines.push(trimmed);
  }

  let changed = false;
  const normalizedSections = [];

  for (const section of sections) {
    if (!changed && section.label === 'Verse 1' && section.lines.length === 8) {
      changed = true;
      normalizedSections.push({
        label: 'Verse 1',
        lines: section.lines.slice(0, 4)
      });
      normalizedSections.push({
        label: 'Chorus',
        lines: section.lines.slice(4)
      });
      continue;
    }

    normalizedSections.push(section);
  }

  if (!changed) {
    return normalizedLyrics;
  }

  const parts = [];

  if (headerLines.length) {
    parts.push(headerLines.join('\n'));
  }

  parts.push(
    ...normalizedSections.map((section) => [section.label, ...section.lines].join('\n'))
  );

  return parts.join('\n\n');
}

function normalizeSectionLabel(label) {
  const verseMatch = label.match(/^Verse\s+(\d+)$/i);

  if (verseMatch) {
    return `Verse ${verseMatch[1]}`;
  }

  return 'Chorus';
}

function readBackupIds(path) {
  let rows;
  try {
    rows = JSON.parse(readFileSync(path, 'utf8'));
  } catch (error) {
    fail(`Could not read backup file: ${error.message}`);
  }

  return new Set(rows.map((row) => row.id).filter(Boolean));
}

function writeLyricsBackup(rows, label) {
  mkdirSync('backups', { recursive: true });

  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const backupPath = `backups/song-lyrics-before-${label}-${timestamp}.json`;
  const backupRows = rows.map((row) => ({
    id: row.id,
    title: row.title,
    oldLyricsText: row.lyrics_text || '',
    newLyricsText: row.formattedLyricsText
  }));

  writeFileSync(backupPath, `${JSON.stringify(backupRows, null, 2)}\n`);

  return backupPath;
}

function formatForProPresenter(title, rawLyrics) {
  const metadataPattern = /^(doh\s+is|key\s*:|bpm\s*:|ccli\s*:)/i;
  const titleText = normalizeSongTitle(title);
  const normalizedRawLyrics = rawLyrics.replace(/\r\n?/g, '\n').trim();
  const alreadyFormatted = normalizedRawLyrics
    .split('\n')
    .some((line) => /^(Verse\s+\d+|Chorus)$/i.test(line.trim()));

  if (alreadyFormatted) {
    return normalizedRawLyrics;
  }

  const metadata = [];
  const lyricLines = [];
  const rawLines = normalizedRawLyrics
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
  npm run songs:admin -- format-numbered-verses
  npm run songs:admin -- format-numbered-verses --write
  npm run songs:admin -- split-verse-one-chorus [backup-path]
  npm run songs:admin -- split-verse-one-chorus [backup-path] --write
  npm run songs:admin -- restore-lyrics-backup <backup-path>
  npm run songs:admin -- restore-lyrics-backup <backup-path> --write
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
