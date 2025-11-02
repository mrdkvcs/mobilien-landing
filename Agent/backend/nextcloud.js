// Nextcloud WebDAV Client for MCP File Storage
// Handles reading/writing MCP context files from Nextcloud

const webdav = require('webdav');
const path = require('path');
const config = require('./config');

// Nextcloud WebDAV client instance
let client = null;

/**
 * Initialize Nextcloud WebDAV client
 */
function initNextcloudClient() {
  // Debug: log configuration status
  if (!config.nextcloud) {
    console.warn('[nextcloud] Nextcloud config object not found');
    return null;
  }
  
  if (!config.nextcloud.url || !config.nextcloud.username || !config.nextcloud.password) {
    console.warn('[nextcloud] Nextcloud not configured, skipping initialization');
    console.warn('[nextcloud] Debug - url:', config.nextcloud.url || 'missing');
    console.warn('[nextcloud] Debug - username:', config.nextcloud.username || 'missing');
    console.warn('[nextcloud] Debug - password:', config.nextcloud.password ? '***' : 'missing');
    return null;
  }

  try {
    const baseURL = `${config.nextcloud.url}/remote.php/dav/files/${config.nextcloud.username}/`;
    client = webdav.createClient(baseURL, {
      username: config.nextcloud.username,
      password: config.nextcloud.password
    });
    console.log('[nextcloud] ✅ WebDAV client initialized');
    return client;
  } catch (error) {
    console.error('[nextcloud] Failed to initialize client:', error.message);
    return null;
  }
}

/**
 * Read a file from Nextcloud
 * @param {string} remotePath - Path relative to user's Nextcloud root (e.g., 'MCP/MCP_BACKEND_CONTEXT.md')
 * @returns {Promise<string|null>} File content as string, or null on error
 */
async function readFile(remotePath) {
  if (!client) {
    client = initNextcloudClient();
    if (!client) {
      console.warn('[nextcloud] Client not available, cannot read file:', remotePath);
      return null;
    }
  }

  try {
    const buffer = await client.getFileContents(remotePath);
    const content = buffer.toString('utf8');
    console.log(`[nextcloud] ✅ Read file: ${remotePath}`);
    return content;
  } catch (error) {
    console.error(`[nextcloud] Failed to read file ${remotePath}:`, error.message);
    return null;
  }
}

/**
 * Write a file to Nextcloud
 * @param {string} remotePath - Path relative to user's Nextcloud root
 * @param {string} content - File content as string
 * @returns {Promise<boolean>} Success status
 */
async function writeFile(remotePath, content) {
  if (!client) {
    client = initNextcloudClient();
    if (!client) {
      console.warn('[nextcloud] Client not available, cannot write file:', remotePath);
      return false;
    }
  }

  try {
    // Ensure parent directory exists
    const dirPath = path.dirname(remotePath);
    if (dirPath !== '.' && dirPath !== '/') {
      try {
        await client.createDirectory(dirPath, { recursive: true });
      } catch (err) {
        // Directory might already exist, ignore error
      }
    }

    await client.putFileContents(remotePath, content, { overwrite: true });
    console.log(`[nextcloud] ✅ Wrote file: ${remotePath}`);
    return true;
  } catch (error) {
    console.error(`[nextcloud] Failed to write file ${remotePath}:`, error.message);
    return false;
  }
}

/**
 * Check if a file exists in Nextcloud
 * @param {string} remotePath - Path relative to user's Nextcloud root
 * @returns {Promise<boolean>} Whether file exists
 */
async function fileExists(remotePath) {
  if (!client) {
    client = initNextcloudClient();
    if (!client) return false;
  }

  try {
    const exists = await client.exists(remotePath);
    return exists;
  } catch (error) {
    console.error(`[nextcloud] Failed to check file existence ${remotePath}:`, error.message);
    return false;
  }
}

/**
 * List files in a directory
 * @param {string} remoteDir - Directory path relative to user's Nextcloud root
 * @returns {Promise<Array>} Array of file/directory names
 */
async function listDirectory(remoteDir) {
  if (!client) {
    client = initNextcloudClient();
    if (!client) return [];
  }

  try {
    const items = await client.getDirectoryContents(remoteDir);
    return items;
  } catch (error) {
    console.error(`[nextcloud] Failed to list directory ${remoteDir}:`, error.message);
    return [];
  }
}

/**
 * Sync MCP file from Nextcloud to local
 * @param {string} remotePath - Nextcloud path
 * @param {string} localPath - Local file path
 * @returns {Promise<boolean>} Success status
 */
async function syncFromNextcloud(remotePath, localPath) {
  const content = await readFile(remotePath);
  if (!content) {
    return false;
  }

  const fs = require('fs');
  const path = require('path');

  try {
    // Ensure local directory exists
    const dir = path.dirname(localPath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    fs.writeFileSync(localPath, content, 'utf8');
    console.log(`[nextcloud] ✅ Synced to local: ${localPath}`);
    return true;
  } catch (error) {
    console.error(`[nextcloud] Failed to write local file ${localPath}:`, error.message);
    return false;
  }
}

/**
 * Sync MCP file from local to Nextcloud
 * @param {string} localPath - Local file path
 * @param {string} remotePath - Nextcloud path
 * @returns {Promise<boolean>} Success status
 */
async function syncToNextcloud(localPath, remotePath) {
  const fs = require('fs');

  try {
    if (!fs.existsSync(localPath)) {
      console.warn(`[nextcloud] Local file not found: ${localPath}`);
      return false;
    }

    const content = fs.readFileSync(localPath, 'utf8');
    return await writeFile(remotePath, content);
  } catch (error) {
    console.error(`[nextcloud] Failed to read local file ${localPath}:`, error.message);
    return false;
  }
}

module.exports = {
  initNextcloudClient,
  readFile,
  writeFile,
  fileExists,
  listDirectory,
  syncFromNextcloud,
  syncToNextcloud
};

