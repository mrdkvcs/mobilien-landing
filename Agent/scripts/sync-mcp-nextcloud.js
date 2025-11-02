// Sync MCP files to/from Nextcloud
// Usage: node scripts/sync-mcp-nextcloud.js [push|pull]

const path = require('path');
const nextcloud = require('../backend/nextcloud');
const config = require('../backend/config');

// MCP files to sync
const MCP_FILES = [
  { local: 'MCP_AGENT_ROOT_CONTEXT.md', remote: 'MCP_AGENT_ROOT_CONTEXT.md' },
  { local: 'backend/MCP_BACKEND_CONTEXT.md', remote: 'backend/MCP_BACKEND_CONTEXT.md' },
  { local: 'shared/MCP_SHARED_CONTEXT.md', remote: 'shared/MCP_SHARED_CONTEXT.md' },
  { local: 'frontend/MCP_FRONTEND_CONTEXT.md', remote: 'frontend/MCP_FRONTEND_CONTEXT.md' },
  { local: 'MCP_SYSTEM_OVERVIEW.md', remote: 'MCP_SYSTEM_OVERVIEW.md' },
  { local: 'MCP_CONTEXT_CHECKLIST.md', remote: 'MCP_CONTEXT_CHECKLIST.md' },
];

async function pushToNextcloud() {
  console.log('[sync] 🔼 Pushing MCP files to Nextcloud...\n');
  
  nextcloud.initNextcloudClient();
  
  for (const file of MCP_FILES) {
    const localPath = path.join(__dirname, '..', file.local);
    const remotePath = `${config.nextcloud.mcpBasePath}/${file.remote}`;
    
    console.log(`[sync] Uploading: ${file.local} → ${remotePath}`);
    const success = await nextcloud.syncToNextcloud(localPath, remotePath);
    
    if (success) {
      console.log(`[sync] ✅ ${file.local}`);
    } else {
      console.error(`[sync] ❌ Failed: ${file.local}`);
    }
  }
  
  console.log('\n[sync] ✅ Push completed!');
}

async function pullFromNextcloud() {
  console.log('[sync] 🔽 Pulling MCP files from Nextcloud...\n');
  
  nextcloud.initNextcloudClient();
  
  for (const file of MCP_FILES) {
    const localPath = path.join(__dirname, '..', file.local);
    const remotePath = `${config.nextcloud.mcpBasePath}/${file.remote}`;
    
    console.log(`[sync] Downloading: ${remotePath} → ${file.local}`);
    const success = await nextcloud.syncFromNextcloud(remotePath, localPath);
    
    if (success) {
      console.log(`[sync] ✅ ${file.local}`);
    } else {
      console.error(`[sync] ❌ Failed: ${file.local}`);
    }
  }
  
  console.log('\n[sync] ✅ Pull completed!');
}

// Main
const command = process.argv[2] || 'push';

if (command === 'push') {
  pushToNextcloud().catch(err => {
    console.error('[sync] Error:', err.message);
    process.exit(1);
  });
} else if (command === 'pull') {
  pullFromNextcloud().catch(err => {
    console.error('[sync] Error:', err.message);
    process.exit(1);
  });
} else {
  console.log('Usage: node scripts/sync-mcp-nextcloud.js [push|pull]');
  console.log('  push - Upload local MCP files to Nextcloud');
  console.log('  pull - Download MCP files from Nextcloud to local');
  process.exit(1);
}

