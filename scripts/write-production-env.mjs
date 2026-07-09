import { readFileSync, writeFileSync } from 'node:fs';

loadDotenv();

const apiBaseUrl = process.env.CLOUDFLARE_API_BASE_URL || '';

const environmentFile = `export const environment = {
  production: true,
  cloudflare: {
    apiBaseUrl: ${JSON.stringify(apiBaseUrl)}
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
