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

// Load context data
function loadContext() {
  try {
    const contextPath = path.join(__dirname, 'context', 'charging-prices.json');
    const contextData = JSON.parse(fs.readFileSync(contextPath, 'utf8'));
    return contextData;
  } catch (error) {
    console.error('Failed to load context:', error.message);
    return null;
  }
}

const contextData = loadContext();

function fetchWithTimeout(resource, options = {}) {
  const { timeoutMs = 30000, ...rest } = options;
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeoutMs);
  return fetch(resource, { ...rest, signal: controller.signal })
    .finally(() => clearTimeout(id));
}

// Basic middlewares
app.use(cors());
app.use(express.json());

// Health check
app.get('/health', (_req, res) => {
  res.json({ ok: true });
});

// Chat proxy: POST /api/chat { message: string }
app.post('/api/chat', async (req, res) => {
  try {
    const { message } = req.body || {};
           const apiKey = AGENT_API_KEY;

    if (!apiKey) {
      return res.status(500).json({ error: 'Hiányzik a AGENT_API_KEY vagy MISTRAL_API_KEY környezeti változó.' });
    }
    if (!message || typeof message !== 'string') {
      return res.status(400).json({ error: 'Hibás kérés: a body-ban "message" sztring szükséges.' });
    }

    // Közvetlen Mistral chat API (nem Agent)
    const url = 'https://api.mistral.ai/v1/chat/completions';

    console.log('[proxy] → outgoing to Mistral', { hasApiKey: !!apiKey, messagePreview: String(message).slice(0, 64) });

           // Build context-aware prompt
           let systemPrompt = `Te vagy Mobi, az e-mobilitási asszisztens. Segítesz az elektromos járművek töltésével, árazással és e-mobilitási kérdésekkel kapcsolatban.

FONTOS: Csak a mellékelt kontextus adatokat használd fel a válaszadáshoz. Ha nincs releváns információ a kontextusban, mondd el, hogy nem tudsz pontos választ adni.`;

           if (contextData) {
             systemPrompt += `\n\nKONTEKSTUS - EV töltési árak Magyarországon (2025. október):\n${JSON.stringify(contextData, null, 2)}`;
           }

    const mistralResponse = await fetchWithTimeout(url, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'mistral-small-latest', // kisebb, gyorsabb model
        messages: [
          {
            role: 'system',
            content: systemPrompt
          },
          {
            role: 'user',
            content: message
          }
        ],
        max_tokens: 500,
        temperature: 0.7
      }),
      timeoutMs: 30000,
    });

    if (!mistralResponse.ok) {
      const text = await mistralResponse.text();
      console.error('[proxy] ← Mistral error', mistralResponse.status, text);
      return res.status(mistralResponse.status).json({ error: 'Mistral hiba', details: text });
    }

    const data = await mistralResponse.json();
    const reply = data?.choices?.[0]?.message?.content || '';
    console.log('[proxy] ← Mistral ok');

    return res.json({ reply });
  } catch (err) {
    console.error('[proxy] unexpected error', err);
    return res.status(500).json({ error: 'Szerver hiba', details: String(err?.message || err) });
  }
});

app.listen(PORT, () => {
  console.log(`Local proxy listening on http://localhost:${PORT}`);
});


