import { readFileSync, writeFileSync } from 'node:fs';

loadDotenv();

const url = process.env.SUPABASE_URL;
const anonKey = process.env.SUPABASE_ANON_KEY;
const songsTable = process.env.SUPABASE_SONGS_TABLE || 'songs';

if (!url || !anonKey) {
  fail('Missing SUPABASE_URL or SUPABASE_ANON_KEY.');
}

const environmentFile = `export const environment = {
  production: true,
  supabase: {
    url: ${JSON.stringify(url)},
    anonKey: ${JSON.stringify(anonKey)},
    songsTable: ${JSON.stringify(songsTable)}
  }
};
`;

writeFileSync('src/environments/environment.prod.ts', environmentFile);
console.log('Wrote src/environments/environment.prod.ts');

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

function fail(message) {
  console.error(message);
  process.exit(1);
}
