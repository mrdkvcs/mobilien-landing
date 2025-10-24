// Minimal Express proxy for Mistral Agent API
// Run: node Agent/server.js

require('dotenv').config();
const express = require('express');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3000;

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
    const apiKey = process.env.AGENT_API_KEY || process.env.MISTRAL_API_KEY;

    if (!apiKey) {
      return res.status(500).json({ error: 'Hiányzik a AGENT_API_KEY vagy MISTRAL_API_KEY környezeti változó.' });
    }
    if (!message || typeof message !== 'string') {
      return res.status(400).json({ error: 'Hibás kérés: a body-ban "message" sztring szükséges.' });
    }

    // Közvetlen Mistral chat API (nem Agent)
    const url = 'https://api.mistral.ai/v1/chat/completions';

    console.log('[proxy] → outgoing to Mistral', { hasApiKey: !!apiKey, messagePreview: String(message).slice(0, 64) });

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


