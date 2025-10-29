// Mobilien AI Agent Server with OpenRouter GPT API
// Run: node Agent/server.js or npm start

const express = require('express');
const cors = require('cors');
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

    // Build system prompt with context
    let systemPrompt = `Te vagy Mobi, az e-mobilitási asszisztens. Segítesz az elektromos járművek töltésével, árazással és e-mobilitási kérdésekkel kapcsolatban.

FONTOS: Csak a mellékelt kontextus adatokat használd fel a válaszadáshoz. Ha nincs releváns információ a kontextusban, mondd el, hogy nem tudsz pontos választ adni.`;

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
      max_tokens: 500,
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
  console.log(`[server] 🤖 Model: ${config.openrouter.model}`);
  console.log(`[server] ✅ Ready to serve requests!`);
});
