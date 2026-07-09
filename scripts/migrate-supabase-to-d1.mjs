import { execFileSync } from 'node:child_process';
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

loadDotenv();

const supabaseUrl = required('SUPABASE_URL');
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY;
const database = process.env.CLOUDFLARE_D1_DATABASE || 'pbc-website';
const shouldApply = process.argv.includes('--write');
const outputPath = join('cloudflare', 'exports', 'supabase-data.sql');
const chunkDir = join('cloudflare', 'exports', 'chunks');
const statementsPerChunk = Number(process.env.D1_IMPORT_STATEMENTS_PER_CHUNK || 100);

if (!supabaseKey) {
  fail('Missing SUPABASE_SERVICE_ROLE_KEY or SUPABASE_ANON_KEY.');
}

const tables = [
  {
    name: 'songs',
    columns: [
      'id',
      'title',
      'song_number',
      'number',
      'author',
      'artist',
      'writer',
      'composer',
      'category',
      'book',
      'song_type',
      'type',
      'lyrics_text',
      'lyrics',
      'lyrics_html',
      'song_key',
      'key',
      'source',
      'is_published',
      'created_at',
      'updated_at'
    ]
  },
  {
    name: 'staff',
    columns: [
      'id',
      'name',
      'email',
      'phone',
      'website',
      'photo_url',
      'short_description',
      'bio',
      'slug',
      'wix_item_path',
      'wix_team_path',
      'wix_owner',
      'sort_order',
      'is_published',
      'source_created_at',
      'source_updated_at',
      'created_at',
      'updated_at'
    ]
  },
  {
    name: 'staff_terms',
    columns: [
      'id',
      'staff_id',
      'role',
      'department',
      'departments',
      'bylaw',
      'order',
      'term_start_year',
      'term_end_year',
      'is_current',
      'source',
      'created_at',
      'updated_at'
    ]
  },
  {
    name: 'song_edit_suggestions',
    columns: [
      'id',
      'song_id',
      'song_title',
      'song_number',
      'original_fields',
      'suggested_fields',
      'submitter_name',
      'submitter_email',
      'note',
      'status',
      'reviewed_by',
      'reviewed_at',
      'review_note',
      'created_at',
      'updated_at'
    ],
    optional: true
  }
];

const deleteOrder = ['song_edit_suggestions', 'staff_terms', 'staff', 'songs'];
const statements = [];
const counts = [];
const exportedRows = new Map();

for (const table of tables) {
  const rows = await fetchAll(table.name, table.optional);

  if (!rows) {
    counts.push(`${table.name}: skipped`);
    continue;
  }

  exportedRows.set(table.name, rows);
  counts.push(`${table.name}: ${rows.length}`);
}

for (const tableName of deleteOrder) {
  if (exportedRows.has(tableName)) {
    statements.push(`delete from ${quoteIdent(tableName)};`);
  }
}

for (const table of tables) {
  const rows = exportedRows.get(table.name);

  if (!rows) {
    continue;
  }

  for (const row of rows) {
    statements.push(insertStatement(table.name, table.columns, row));
  }
}

mkdirSync(join('cloudflare', 'exports'), { recursive: true });
writeFileSync(outputPath, `${statements.join('\n')}\n`);

console.log(`Wrote ${outputPath}`);
console.log(counts.join('\n'));

if (!shouldApply) {
  console.log('\nDry run only. Add --write to import into remote D1.');
  process.exit(0);
}

if (!process.env.CLOUDFLARE_API_TOKEN) {
  fail('Missing CLOUDFLARE_API_TOKEN. Set it locally before running with --write.');
}

const wranglerBin = join(process.cwd(), 'node_modules', 'wrangler', 'bin', 'wrangler.js');
const chunkPaths = writeChunks(statements);

for (let index = 0; index < chunkPaths.length; index += 1) {
  console.log(`Importing chunk ${index + 1}/${chunkPaths.length}: ${chunkPaths[index]}`);
  execFileSync(process.execPath, [wranglerBin, 'd1', 'execute', database, '--remote', '--file', chunkPaths[index]], {
    stdio: 'inherit'
  });
}

async function fetchAll(tableName, optional) {
  const pageSize = 1000;
  const rows = [];
  let offset = 0;

  while (true) {
    const endpoint = new URL(`/rest/v1/${tableName}`, supabaseUrl);
    endpoint.searchParams.set('select', '*');
    endpoint.searchParams.set('offset', String(offset));
    endpoint.searchParams.set('limit', String(pageSize));

    const response = await fetch(endpoint, {
      headers: {
        apikey: supabaseKey,
        Authorization: `Bearer ${supabaseKey}`,
        Accept: 'application/json'
      }
    });

    if (!response.ok) {
      const body = await response.text();

      if (optional && response.status === 401) {
        return undefined;
      }

      fail(`Could not export ${tableName}: ${response.status} ${body}`);
    }

    const page = await response.json();

    if (!Array.isArray(page)) {
      fail(`Unexpected ${tableName} response from Supabase.`);
    }

    rows.push(...page);

    if (page.length < pageSize) {
      return rows;
    }

    offset += pageSize;
  }
}

function insertStatement(tableName, columns, row) {
  const values = columns.map((column) => sqlValue(normalizeValue(tableName, column, row[column])));
  const columnList = columns.map(quoteIdent).join(', ');

  return `insert into ${quoteIdent(tableName)} (${columnList}) values (${values.join(', ')});`;
}

function writeChunks(allStatements) {
  mkdirSync(chunkDir, { recursive: true });

  const chunks = [];

  for (let index = 0; index < allStatements.length; index += statementsPerChunk) {
    const chunkIndex = chunks.length + 1;
    const chunkPath = join(chunkDir, `supabase-data-${String(chunkIndex).padStart(4, '0')}.sql`);
    const chunk = allStatements.slice(index, index + statementsPerChunk);
    writeFileSync(chunkPath, `${chunk.join('\n')}\n`);
    chunks.push(chunkPath);
  }

  return chunks;
}

function normalizeValue(tableName, column, value) {
  if (value === undefined) {
    return null;
  }

  if (value === null) {
    if (['sort_order', 'order'].includes(column)) {
      return 0;
    }

    if (['is_published', 'is_current'].includes(column)) {
      return 1;
    }

    if (column === 'source') {
      return 'wix';
    }

    if (column === 'status') {
      return 'pending';
    }

    if (['created_at', 'updated_at'].includes(column)) {
      return new Date().toISOString();
    }

    return null;
  }

  if (['is_published', 'is_current'].includes(column)) {
    return value === true || value === 1 || value === '1' ? 1 : 0;
  }

  if (tableName === 'staff_terms' && column === 'departments') {
    return Array.isArray(value) ? JSON.stringify(value) : value;
  }

  if (tableName === 'song_edit_suggestions' && ['original_fields', 'suggested_fields'].includes(column)) {
    return typeof value === 'string' ? value : JSON.stringify(value ?? {});
  }

  return value;
}

function sqlValue(value) {
  if (value === null) {
    return 'null';
  }

  if (typeof value === 'number') {
    return Number.isFinite(value) ? String(value) : 'null';
  }

  return `'${String(value).replace(/'/g, "''")}'`;
}

function quoteIdent(value) {
  return `"${value.replace(/"/g, '""')}"`;
}

function loadDotenv() {
  let content;

  try {
    content = readFileSync('.env', 'utf8');
  } catch {
    return;
  }

  for (const line of content.split(/\r?\n/)) {
    const trimmed = line.trim();

    if (!trimmed || trimmed.startsWith('#')) {
      continue;
    }

    const index = trimmed.indexOf('=');

    if (index === -1) {
      continue;
    }

    const key = trimmed.slice(0, index).trim();
    const value = trimmed.slice(index + 1).trim();

    if (!process.env[key]) {
      process.env[key] = value;
    }
  }
}

function required(name) {
  const value = process.env[name];

  if (!value) {
    fail(`Missing ${name}.`);
  }

  return value;
}

function fail(message) {
  console.error(message);
  process.exit(1);
}
