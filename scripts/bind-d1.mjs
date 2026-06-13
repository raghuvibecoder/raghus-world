// bind-d1.mjs - Bind D1 database to Cloudflare Pages project
// Uses wrangler's stored OAuth token

import { readFileSync, existsSync } from 'fs';
import { join } from 'path';
import os from 'os';

const ACCOUNT_ID = 'd160521d57096ccebc36b2975c3fdc5c';
const PROJECT_NAME = 'raghus-world';
const DB_ID = '7636f010-2824-4460-8679-20e3840d4dad';
const DB_NAME = 'raghus-world-db';
const BINDING = 'DB';

// Try to read wrangler OAuth token from config
const wranglerConfigPaths = [
  join(os.homedir(), 'AppData', 'Roaming', 'xdg.config', '.wrangler', 'config', 'default.toml'),
  join(os.homedir(), '.wrangler', 'config', 'default.toml'),
];

let token = null;
for (const p of wranglerConfigPaths) {
  if (existsSync(p)) {
    const content = readFileSync(p, 'utf8');
    console.log('Found wrangler config at:', p);
    // Parse oauth_token from TOML
    const match = content.match(/oauth_token\s*=\s*"([^"]+)"/);
    if (match) {
      token = match[1];
      console.log('Found OAuth token');
    }
    break;
  }
}

if (!token) {
  console.log('No OAuth token found in wrangler config. Listing config locations searched:');
  wranglerConfigPaths.forEach(p => console.log(' -', p, existsSync(p) ? '(exists)' : '(not found)'));
  process.exit(1);
}

// Fetch current project config
const getRes = await fetch(
  `https://api.cloudflare.com/client/v4/accounts/${ACCOUNT_ID}/pages/projects/${PROJECT_NAME}`,
  { headers: { 'Authorization': `Bearer ${token}` } }
);
const project = await getRes.json();

if (!project.success) {
  console.error('Failed to fetch project:', JSON.stringify(project.errors));
  process.exit(1);
}

console.log('Current deployment config:', JSON.stringify(project.result?.deployment_configs?.production?.d1_databases, null, 2));

// PATCH to add D1 binding
const patchBody = {
  deployment_configs: {
    production: {
      d1_databases: {
        [BINDING]: {
          id: DB_ID
        }
      }
    },
    preview: {
      d1_databases: {
        [BINDING]: {
          id: DB_ID
        }
      }
    }
  }
};

const patchRes = await fetch(
  `https://api.cloudflare.com/client/v4/accounts/${ACCOUNT_ID}/pages/projects/${PROJECT_NAME}`,
  {
    method: 'PATCH',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(patchBody)
  }
);

const patchData = await patchRes.json();
if (patchData.success) {
  console.log('✅ D1 binding successfully added!');
  console.log('Database:', DB_NAME, '→ Binding:', BINDING);
  console.log('Updated D1 config:', JSON.stringify(patchData.result?.deployment_configs?.production?.d1_databases, null, 2));
} else {
  console.error('❌ Failed to add binding:', JSON.stringify(patchData.errors, null, 2));
  process.exit(1);
}
