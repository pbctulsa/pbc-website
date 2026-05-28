import { createClient } from '@supabase/supabase-js';
import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';

loadDotenv();

const url = process.env.SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const staffTable = process.env.SUPABASE_STAFF_TABLE || 'staff';
const termsTable = process.env.SUPABASE_STAFF_TERMS_TABLE || 'staff_terms';

if (!url || !serviceRoleKey) {
  fail('Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env');
}

const supabase = createClient(url, serviceRoleKey, {
  auth: {
    persistSession: false,
    autoRefreshToken: false
  }
});

const [command, ...args] = process.argv.slice(2);

switch (command) {
  case 'preview':
    await previewStaff(args[0], parseOptions(args.slice(1)));
    break;
  case 'import':
    await importStaff(args[0], parseOptions(args.slice(1)));
    break;
  case 'count':
    await countStaff();
    break;
  case 'sample':
    await sampleStaff(Number(args[0] || 5));
    break;
  default:
    printUsage();
    process.exit(command ? 1 : 0);
}

async function previewStaff(path, options) {
  const { staff, terms } = readImport(path, options);

  console.log(`${staff.length} staff rows and ${terms.length} term rows parsed from ${path}`);
  console.table(
    staff.slice(0, 10).map((member, index) => ({
      name: member.name,
      role: terms[index]?.role,
      department: terms[index]?.department,
      term: termLabel(terms[index]),
      email: member.email,
      hasBio: Boolean(member.bio),
      hasPhoto: Boolean(member.photo_url)
    }))
  );
}

async function importStaff(path, options) {
  const { staff, terms } = readImport(path, options);

  if (!options.write) {
    console.log(`${staff.length} staff rows and ${terms.length} term rows ready to import.`);
    console.log('Dry run only. Add --write to upsert into Supabase.');
    console.log(JSON.stringify({ staff: staff.slice(0, 2), terms: terms.slice(0, 2) }, null, 2));
    return;
  }

  const staffResult = await supabase
    .from(staffTable)
    .upsert(staff, { onConflict: 'id' });

  if (staffResult.error) {
    fail(formatSupabaseError(staffResult.error));
  }

  const termResult = await supabase
    .from(termsTable)
    .upsert(terms, { onConflict: 'id' });

  if (termResult.error) {
    fail(formatSupabaseError(termResult.error));
  }

  console.log(`Upserted ${staff.length} staff rows into ${staffTable}.`);
  console.log(`Upserted ${terms.length} term rows into ${termsTable}.`);
}

async function countStaff() {
  const staffResult = await supabase
    .from(staffTable)
    .select('id', { count: 'exact', head: true });

  if (staffResult.error) {
    fail(formatSupabaseError(staffResult.error));
  }

  const termResult = await supabase
    .from(termsTable)
    .select('id', { count: 'exact', head: true });

  if (termResult.error) {
    fail(formatSupabaseError(termResult.error));
  }

  console.log(`${staffResult.count ?? 0} rows in ${staffTable}`);
  console.log(`${termResult.count ?? 0} rows in ${termsTable}`);
}

async function sampleStaff(limit) {
  const { data, error } = await supabase
    .from(staffTable)
    .select('id,name,email,sort_order,staff_terms(role,department,term_start_year,term_end_year,is_current)')
    .order('sort_order', { ascending: true })
    .limit(limit);

  if (error) {
    fail(formatSupabaseError(error));
  }

  console.log(JSON.stringify(data ?? [], null, 2));
}

function readImport(path, options) {
  const rows = readStaffCsv(path);
  const staff = rows.map(mapStaffRow);
  const terms = rows.map((row, index) => mapTermRow(row, staff[index], index, options));

  return { staff, terms };
}

function readStaffCsv(path) {
  if (!path) {
    fail('Missing CSV path.');
  }

  const csv = readFileSync(path, 'utf8').replace(/^\uFEFF/, '');
  const [headers, ...records] = parseCsv(csv);

  return records
    .filter((record) => record.some((value) => value.trim()))
    .map((record) => Object.fromEntries(headers.map((header, index) => [header, record[index] || ''])));
}

function parseCsv(csv) {
  const rows = [];
  let row = [];
  let field = '';
  let inQuotes = false;

  for (let index = 0; index < csv.length; index += 1) {
    const char = csv[index];
    const next = csv[index + 1];

    if (char === '"') {
      if (inQuotes && next === '"') {
        field += '"';
        index += 1;
      } else {
        inQuotes = !inQuotes;
      }

      continue;
    }

    if (char === ',' && !inQuotes) {
      row.push(field);
      field = '';
      continue;
    }

    if ((char === '\n' || char === '\r') && !inQuotes) {
      if (char === '\r' && next === '\n') {
        index += 1;
      }

      row.push(field);
      rows.push(row);
      row = [];
      field = '';
      continue;
    }

    field += char;
  }

  if (field || row.length) {
    row.push(field);
    rows.push(row);
  }

  return rows;
}

function mapStaffRow(row, index) {
  const itemPath = clean(row['Staff (Item)']);
  const name = clean(row.Name) || 'Unnamed Staff Member';

  return {
    id: clean(row.ID) || deterministicUuid(`staff:${name}:${index}`),
    name,
    email: clean(row.Email),
    phone: clean(row.Phone),
    website: clean(row.Website),
    photo_url: wixImageToUrl(clean(row.Photo)),
    short_description: clean(row['Short Description']),
    bio: richTextToPlainText(clean(row['Long Description'])),
    slug: itemPath ? itemPath.split('/').filter(Boolean).at(-1) : slugify(name),
    wix_item_path: itemPath,
    wix_team_path: clean(row['Team (All)']),
    wix_owner: clean(row.Owner),
    sort_order: index + 1,
    is_published: true,
    source_created_at: clean(row['Created Date']) || null,
    source_updated_at: clean(row['Updated Date']) || null,
    updated_at: new Date().toISOString()
  };
}

function mapTermRow(row, staff, index, options) {
  const role = clean(row['Job Title']) || 'Staff';
  const department = clean(row.Commitee);
  const departments = parseMultiValue(row.Departments || row['Departments']);
  const startYear = options.termStartYear ?? null;
  const endYear = options.termEndYear ?? null;
  const order = Number.isFinite(Number(row.Order)) ? Number(row.Order) : index + 1;
  const normalizedDepartments = departments.length ? departments : department ? [department] : [];

  return {
    id: deterministicUuid(`term:${staff.id}:${role}:${normalizedDepartments.join('|')}:${startYear || ''}:${endYear || ''}:${order}`),
    staff_id: staff.id,
    role,
    department,
    departments: normalizedDepartments.length ? normalizedDepartments : null,
    bylaw: clean(row.ByLaw),
    term_start_year: startYear,
    term_end_year: endYear,
    order,
    is_current: options.current,
    source: 'wix',
    updated_at: new Date().toISOString()
  };
}

function richTextToPlainText(value) {
  if (!value) {
    return undefined;
  }

  try {
    const document = JSON.parse(value);
    const paragraphs = [];
    collectParagraphs(document, paragraphs);
    return clean(paragraphs.join('\n\n'));
  } catch {
    return clean(value);
  }
}

function collectParagraphs(node, paragraphs) {
  if (!node || typeof node !== 'object') {
    return;
  }

  if (node.type === 'PARAGRAPH') {
    const parts = [];
    collectText(node, parts);
    const text = clean(parts.join(''));

    if (text) {
      paragraphs.push(text);
    }

    return;
  }

  if (Array.isArray(node.nodes)) {
    for (const child of node.nodes) {
      collectParagraphs(child, paragraphs);
    }
  }
}

function collectText(node, parts) {
  if (!node || typeof node !== 'object') {
    return;
  }

  if (node.textData?.text) {
    parts.push(node.textData.text);
  }

  if (Array.isArray(node.nodes)) {
    for (const child of node.nodes) {
      collectText(child, parts);
    }
  }
}

function wixImageToUrl(value) {
  if (!value) {
    return undefined;
  }

  if (!value.startsWith('wix:image://v1/')) {
    return value;
  }

  const mediaId = value.replace('wix:image://v1/', '').split('/')[0];
  return mediaId ? `https://static.wixstatic.com/media/${mediaId}` : undefined;
}

function parseOptions(args) {
  const options = {
    current: !args.includes('--not-current'),
    write: args.includes('--write'),
    termStartYear: undefined,
    termEndYear: undefined
  };

  for (let index = 0; index < args.length; index += 1) {
    if (args[index] === '--term-start') {
      options.termStartYear = Number(args[index + 1]);
      index += 1;
    } else if (args[index] === '--term-end') {
      options.termEndYear = Number(args[index + 1]);
      index += 1;
    }
  }

  if (Number.isNaN(options.termStartYear)) {
    fail('--term-start must be a number.');
  }

  if (Number.isNaN(options.termEndYear)) {
    fail('--term-end must be a number.');
  }

  return options;
}

function termLabel(term) {
  if (!term) {
    return '';
  }

  if (term.term_start_year && term.term_end_year) {
    return `${term.term_start_year}-${term.term_end_year}`;
  }

  return term.is_current ? 'Current' : 'Historical';
}

function deterministicUuid(value) {
  const hex = createHash('sha256').update(value).digest('hex').slice(0, 32);
  return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-4${hex.slice(13, 16)}-8${hex.slice(17, 20)}-${hex.slice(20)}`;
}

function slugify(value) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

function clean(value) {
  if (typeof value !== 'string') {
    return undefined;
  }

  const cleaned = value.trim();
  return cleaned || undefined;
}

function parseMultiValue(value) {
  const cleaned = clean(value);

  if (!cleaned) {
    return [];
  }

  return cleaned
    .split(/[;,]/)
    .map((part) => part.trim())
    .filter(Boolean);
}

function formatSupabaseError(error) {
  return [error.code, error.message, error.details, error.hint].filter(Boolean).join('\n');
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

function printUsage() {
  console.log(`Usage:
  npm run staff:admin -- preview <csv-path> [--term-start 2025 --term-end 2027]
  npm run staff:admin -- import <csv-path> [--term-start 2025 --term-end 2027] [--write]
  npm run staff:admin -- count
  npm run staff:admin -- sample [limit]

Before importing, run supabase/staff.sql in the Supabase SQL editor.`);
}

function fail(message) {
  console.error(message);
  process.exit(1);
}
