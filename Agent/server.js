// Minimal Express proxy for Mistral Agent API
// Run: node Agent/server.js

// Load API key directly from key.env
const fs = require('fs');
const path = require('path');
const envPath = path.resolve(__dirname, '../key.env');
let AGENT_API_KEY = process.env.AGENT_API_KEY || process.env.MISTRAL_API_KEY;

console.log('[proxy] Initial API key:', AGENT_API_KEY ? 'Found' : 'Not found');
console.log('[proxy] Env path:', envPath);
console.log('[proxy] File exists:', fs.existsSync(envPath));

if (!AGENT_API_KEY && fs.existsSync(envPath)) {
  try {
    const envContent = fs.readFileSync(envPath, 'utf8');
    console.log('[proxy] File content:', envContent);
    const lines = envContent.split('\n');
    for (const line of lines) {
      if (line.includes('AGENT_API_KEY=')) {
        const parts = line.split('=');
        if (parts.length > 1) {
          AGENT_API_KEY = parts[1].trim();
          console.log('[proxy] Loaded API key from file:', AGENT_API_KEY ? 'Found' : 'Not found');
          break;
        }
      }
    }
  } catch (error) {
    console.error('[proxy] Error reading key.env:', error.message);
  }
}

console.log('[proxy] Final API key:', AGENT_API_KEY ? 'Found' : 'Not found');
const express = require('express');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3000;

// Load context data from PostgreSQL
const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: false
});

async function loadContext() {
  try {
    const result = await pool.query(
      'SELECT data FROM context_data WHERE category = $1 AND key_name = $2',
      ['charging_prices', 'hungary_2025']
    );
    if (result.rows.length > 0) {
      console.log('[proxy] Context loaded from PostgreSQL');
      return result.rows[0].data;
    } else {
      console.warn('[proxy] No context data found in PostgreSQL');
      return null;
    }
  } catch (error) {
    console.error('[proxy] Failed to load context from PostgreSQL:', error.message);
    return null;
  }
}

let contextData = null;

// Initialize context
(async () => {
  try {
    console.log('[proxy] Starting context initialization...');
    contextData = await loadContext();
    console.log('[proxy] Context initialization completed. Data loaded:', !!contextData);
  } catch (error) {
    console.error('[proxy] Context initialization failed:', error);
  }
})();

function fetchWithTimeout(resource, options = {}) {
  const { timeoutMs = 30000, ...rest } = options;
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeoutMs);
  return fetch(resource, { ...rest, signal: controller.signal })
    .finally(() => clearTimeout(id));
}

// Middleware
// CORS configuration for production
app.use(cors({
  origin: [
    'https://mobilien.app',
    'https://www.mobilien.app',
    'http://localhost:8000',  // For local development
    'http://localhost:3000'   // For local development
  ],
  credentials: true,
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Helper function to generate session ID
function generateSessionId() {
  return `session_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`;
}

// Helper function to create or get session
async function createOrGetSession(sessionId, userIp, userAgent) {
  try {
    const result = await pool.query(
      `INSERT INTO chat_sessions (session_id, user_ip, user_agent) 
       VALUES ($1, $2, $3) 
       ON CONFLICT (session_id) DO NOTHING 
       RETURNING session_id`,
      [sessionId, userIp, userAgent]
    );
    return sessionId;
  } catch (error) {
    console.error('[proxy] Error creating session:', error.message);
    return sessionId;
  }
}

// Helper function to save message
async function saveMessage(sessionId, role, content, responseTimeMs = null, tokensUsed = null, contextUsed = false, errorOccurred = false, errorMessage = null) {
  try {
    await pool.query(
      `INSERT INTO chat_messages (session_id, role, content, response_time_ms, tokens_used, model_used, context_used, error_occurred, error_message) 
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
      [sessionId, role, content, responseTimeMs, tokensUsed, 'mistral-small-latest', contextUsed, errorOccurred, errorMessage]
    );
  } catch (error) {
    console.error('[proxy] Error saving message:', error.message);
  }
}

// Chat endpoint
app.post('/api/chat', async (req, res) => {
  const startTime = Date.now();
  try {
    const { message, sessionId: clientSessionId } = req.body;
    
    if (!message || typeof message !== 'string') {
      return res.status(400).json({ error: 'Invalid message format' });
    }

    if (!AGENT_API_KEY) {
      return res.status(500).json({ error: 'Missing API key' });
    }

    // Session management
    const sessionId = clientSessionId || generateSessionId();
    const userIp = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
    const userAgent = req.headers['user-agent'];
    
    await createOrGetSession(sessionId, userIp, userAgent);
    
    console.log('[proxy] Processing message for session:', sessionId);

    // Build system prompt with context
    let systemPrompt = `Te vagy Mobi, az e-mobilitási asszisztens. Segítesz az elektromos járművek töltésével, árazással és e-mobilitási kérdésekkel kapcsolatban.

FONTOS: Csak a mellékelt kontextus adatokat használd fel a válaszadáshoz. Ha nincs releváns információ a kontextusban, mondd el, hogy nem tudsz pontos választ adni.`;

    if (contextData) {
      systemPrompt += `\n\nKONTEKSTUS - EV töltési árak Magyarországon (2025. január):\n${JSON.stringify(contextData, null, 2)}`;
      console.log('[proxy] Context included in prompt');
    } else {
      console.warn('[proxy] No context data available');
    }

    const messages = [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: message }
    ];

    console.log('[proxy] Sending request to Mistral API...');
    
    const mistralResponse = await fetchWithTimeout('https://api.mistral.ai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${AGENT_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'mistral-small-latest',
        messages,
        max_tokens: 500,
        temperature: 0.7
      }),
      timeoutMs: 30000,
    });

    if (!mistralResponse.ok) {
      const errorText = await mistralResponse.text();
      console.error('[proxy] Mistral API error:', mistralResponse.status, errorText);
      return res.status(mistralResponse.status).json({ 
        error: 'Mistral API error', 
        details: errorText 
      });
    }

    const data = await mistralResponse.json();
    const reply = data?.choices?.[0]?.message?.content || 'Sajnálom, nem tudok válaszolni.';
    const tokensUsed = data?.usage?.total_tokens || null;
    
    const responseTime = Date.now() - startTime;
    console.log('[proxy] Response received from Mistral API in', responseTime, 'ms');
    
    // Save user message
    await saveMessage(sessionId, 'user', message, null, null, false, false, null);
    
    // Save assistant response
    await saveMessage(sessionId, 'assistant', reply, responseTime, tokensUsed, !!contextData, false, null);
    
    res.json({ reply, sessionId });
  } catch (error) {
    console.error('[proxy] Server error:', error);
    
    // Save error message if session exists
    if (req.body.sessionId) {
      await saveMessage(req.body.sessionId, 'assistant', 'Hiba történt a válasz generálása során.', null, null, false, true, error.message);
    }
    
    res.status(500).json({ 
      error: 'Server error', 
      details: error.message 
    });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`[proxy] Local proxy listening on http://localhost:${PORT}`);
  console.log(`[proxy] API endpoint: http://localhost:${PORT}/api/chat`);
});
