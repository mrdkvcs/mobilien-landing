// Mobilien AI Agent Server with OpenRouter GPT API
// Run: node Agent/backend/server.js or npm start

const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const config = require('./config');
const openrouter = require('./openrouter');

const app = express();
const PORT = config.server.port;

// Load context data from PostgreSQL
const { Pool } = require('pg');

const pool = new Pool({
  connectionString: config.database.connectionString,
  ssl: config.database.ssl
});

// Ensure newsletter_subscriptions table exists
const ensureNewsletterTableSQL = `
CREATE TABLE IF NOT EXISTS newsletter_subscriptions (
  id SERIAL PRIMARY KEY,
  email TEXT NOT NULL UNIQUE,
  source TEXT,
  ip_address TEXT,
  user_agent TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
`;

(async () => {
  try {
    await pool.query(ensureNewsletterTableSQL);
    console.log('[server] Ensured newsletter_subscriptions table exists');
  } catch (err) {
    console.error('[server] Failed to ensure newsletter_subscriptions table:', err.message);
  }
})();

async function loadContext() {
  try {
    const result = await pool.query(
      'SELECT data FROM context_data WHERE category = $1 AND key_name = $2',
      ['charging_prices', 'hungary_2025']
    );
    if (result.rows.length > 0) {
      console.log('[server] Context loaded from PostgreSQL');
      return result.rows[0].data;
    } else {
      console.warn('[server] No context data found in PostgreSQL');
      return null;
    }
  } catch (error) {
    console.error('[server] Failed to load context from PostgreSQL:', error.message);
    return null;
  }
}

// Load system prompt from file
let systemPromptTemplate = '';
try {
  const promptPath = path.join(__dirname, '../shared/prompts/mobi-system-prompt.txt');
  if (fs.existsSync(promptPath)) {
    systemPromptTemplate = fs.readFileSync(promptPath, 'utf8');
    console.log('[server] System prompt template loaded');
  } else {
    console.error('[server] System prompt file not found at:', promptPath);
  }
} catch (error) {
  console.error('[server] Failed to load system prompt:', error.message);
}

// Load graph context from file
let graphContext = null;
try {
  const graphPath = path.join(__dirname, '../shared/knowledge/context-graph.json');
  if (fs.existsSync(graphPath)) {
    graphContext = JSON.parse(fs.readFileSync(graphPath, 'utf8'));
    console.log('[server] Graph context loaded from file');
  }
} catch (error) {
  console.error('[server] Failed to load graph context:', error.message);
}

let contextData = null;

// Initialize context
loadContext().then(data => {
  contextData = data;
  console.log('[server] Context initialization completed');
});

// Middleware
// CORS configuration for production
app.use(cors({
  origin: config.server.corsOrigins,
  credentials: true,
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Newsletter signup endpoint
app.post('/api/newsletter', async (req, res) => {
  try {
    const { email, source } = req.body || {};

    if (!email || typeof email !== 'string') {
      return res.status(400).json({ error: 'Email is required' });
    }

    const normalizedEmail = String(email).trim().toLowerCase();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(normalizedEmail)) {
      return res.status(400).json({ error: 'Invalid email format' });
    }

    // Get client IP address
    const xff = req.headers['x-forwarded-for'];
    let ipAddress = '';
    if (Array.isArray(xff)) {
      ipAddress = String(xff[0] || '').split(',')[0].trim();
    } else if (typeof xff === 'string' && xff.length > 0) {
      ipAddress = xff.split(',')[0].trim();
    }
    if (!ipAddress) {
      ipAddress =
        (req.headers['cf-connecting-ip'] && String(req.headers['cf-connecting-ip'])) ||
        (req.headers['x-real-ip'] && String(req.headers['x-real-ip'])) ||
        (req.ip && String(req.ip)) ||
        (req.socket && req.socket.remoteAddress) ||
        '';
    }
    if (ipAddress && ipAddress.startsWith('::ffff:')) {
      ipAddress = ipAddress.substring(7);
    }
    const userAgent = req.headers['user-agent'] || '';

    const result = await pool.query(
      `INSERT INTO newsletter_subscriptions (email, source, ip_address, user_agent)
       VALUES ($1, $2, $3, $4)
       ON CONFLICT (email) DO UPDATE
         SET source = COALESCE(EXCLUDED.source, newsletter_subscriptions.source),
             ip_address = COALESCE(EXCLUDED.ip_address, newsletter_subscriptions.ip_address),
             user_agent = COALESCE(EXCLUDED.user_agent, newsletter_subscriptions.user_agent),
             updated_at = NOW()
       RETURNING id, email, created_at`,
      [normalizedEmail, source || null, ipAddress || null, userAgent || null]
    );

    const id = result.rows[0].id;
    console.log(`[server] Newsletter signup stored - ID: ${id}, Email: ${normalizedEmail}`);

    return res.status(201).json({ success: true, id });
  } catch (error) {
    console.error('[server] Newsletter signup error:', error);
    return res.status(500).json({ error: 'Failed to store newsletter signup', details: error.message });
  }
});

// Chat endpoint
app.post('/api/chat', async (req, res) => {
  try {
    const { message } = req.body;
    
    if (!message || typeof message !== 'string') {
      return res.status(400).json({ error: 'Invalid message format' });
    }

    if (!config.openrouter.apiKey) {
      return res.status(500).json({ error: 'Missing API key' });
    }

    console.log('[server] Processing message:', message);

    // Build system prompt from template
    let systemPrompt = systemPromptTemplate.replace(
      '{{GRAPH_CONTEXT}}',
      JSON.stringify(graphContext, null, 2)
    );

    if (contextData) {
      systemPrompt += `\n\nKONTEXTUS - EV töltési árak Magyarországon (2025. január):\n${JSON.stringify(contextData, null, 2)}`;
      console.log('[server] Context included in prompt');
    } else {
      console.warn('[server] No context data available');
    }

    const messages = [
      openrouter.systemMessage(systemPrompt),
      openrouter.userMessage(message)
    ];

    console.log('[server] Sending request to OpenRouter API...');
    console.log('[server] Using model:', config.openrouter.model);
    
    const response = await openrouter.chatCompletion(messages, {
      min_tokens: 500,
      max_tokens: 2000,
      temperature: 0.7
    });

    const reply = openrouter.getReplyText(response) || 'Sajnálom, nem tudok válaszolni.';
    
    console.log('[server] Response received from OpenRouter API');
    console.log('[server] Tokens used:', response.usage?.total_tokens || 'N/A');
    
    res.json({ reply });
  } catch (error) {
    console.error('[server] Server error:', error);
    res.status(500).json({ 
      error: 'Server error', 
      details: error.message 
    });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`[server] 🚀 Mobilien AI Agent listening on http://localhost:${PORT}`);
  console.log(`[server] 💬 API endpoint: http://localhost:${PORT}/api/chat`);
  console.log(`[server] ✉️ Newsletter endpoint: http://localhost:${PORT}/api/newsletter`);
  console.log(`[server] 🤖 Model: ${config.openrouter.model}`);
  console.log(`[server] ✅ Ready to serve requests!`);
});

