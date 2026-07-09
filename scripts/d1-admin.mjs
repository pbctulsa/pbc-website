import { execFileSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

loadDotenv();

const database = process.env.CLOUDFLARE_D1_DATABASE || 'pbc-website';
const isRemote = process.env.CLOUDFLARE_D1_REMOTE === 'true';
const [area, command = 'count', ...args] = process.argv.slice(2);

if (!['songs', 'staff', 'sql'].includes(area)) {
  printUsage();
  process.exit(area ? 1 : 0);
}

if (area === 'sql') {
  const sql = [command, ...args].join(' ').trim();

  if (!sql) {
    fail('Usage: node scripts/d1-admin.mjs sql "<sql>"');
  }

  executeSql(sql);
  process.exit(0);
}

switch (`${area}:${command}`) {
  case 'songs:count':
    executeSql('select count(*) as total from songs;');
    break;
  case 'songs:sample':
    executeSql(`select id, title, song_number, book, is_published from songs order by coalesce(song_number, number), title limit ${limit(args[0])};`);
    break;
  case 'songs:set-published':
    setSongPublished(args[0], args[1]);
    break;
  case 'staff:count':
    executeSql('select (select count(*) from staff) as staff_total, (select count(*) from staff_terms) as term_total;');
    break;
  case 'staff:sample':
    executeSql(`select id, name, email, sort_order, is_published from staff order by sort_order, name limit ${limit(args[0])};`);
    break;
  default:
    printUsage();
    process.exit(1);
}

function setSongPublished(id, value) {
  if (!id || !['true', 'false'].includes(value)) {
    fail('Usage: npm run songs:admin -- set-published <song-id> <true|false>');
  }

  executeSql(`update songs set is_published = ${value === 'true' ? 1 : 0}, updated_at = current_timestamp where id = ${sqlString(id)};`);
}

function executeSql(sql) {
  const wranglerBin = join(process.cwd(), 'node_modules', 'wrangler', 'bin', 'wrangler.js');
  const args = [wranglerBin, 'd1', 'execute', database, '--command', sql, isRemote ? '--remote' : '--local'];

  execFileSync(process.execPath, args, {
    stdio: 'inherit'
  });
}

function sqlString(value) {
  return `'${String(value).replace(/'/g, "''")}'`;
}

function limit(raw) {
  const value = Number(raw || 5);
  return Number.isInteger(value) && value > 0 && value <= 100 ? value : 5;
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
  npm run songs:admin -- count
  npm run songs:admin -- sample [limit]
  npm run songs:admin -- set-published <song-id> <true|false>
  npm run staff:admin -- count
  npm run staff:admin -- sample [limit]
  node scripts/d1-admin.mjs sql "select * from songs limit 5"

Set CLOUDFLARE_D1_REMOTE=true to target the remote D1 database.`);
}

function fail(message) {
  console.error(message);
  process.exit(1);
}
