import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

// Load context data
function loadContext() {
  try {
    const contextPath = path.join(process.cwd(), 'Agent', 'context', 'charging-prices.json');
    const contextData = JSON.parse(fs.readFileSync(contextPath, 'utf8'));
    return contextData;
  } catch (error) {
    console.error('[api] Failed to load context:', error);
    return null;
  }
}

const contextData = loadContext();

async function fetchWithTimeout(resource: string, options: any = {}) {
  const { timeoutMs = 30000, ...rest } = options;
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeoutMs);
  return fetch(resource, { ...rest, signal: controller.signal })
    .finally(() => clearTimeout(id));
}

export async function POST(request: NextRequest) {
  try {
    const { message } = await request.json();
    const apiKey = process.env.AGENT_API_KEY || process.env.MISTRAL_API_KEY || 'iURK1Q2QKWiWpSMQTWveLoSkXhGvsEiv';

    if (!apiKey) {
      return NextResponse.json({ error: 'Missing API key' }, { status: 500 });
    }
    if (!message || typeof message !== 'string') {
      return NextResponse.json({ error: 'Invalid message format' }, { status: 400 });
    }

    // Build context-aware prompt
    let systemPrompt = `Te vagy Mobi, az e-mobilitási asszisztens. Segítesz az elektromos járművek töltésével, árazással és e-mobilitási kérdésekkel kapcsolatban.

FONTOS: Csak a mellékelt kontextus adatokat használd fel a válaszadáshoz. Ha nincs releváns információ a kontextusban, mondd el, hogy nem tudsz pontos választ adni.`;

    if (contextData) {
      systemPrompt += `\n\nKONTEKSTUS - EV töltési árak Magyarországon (2025. október):\n${JSON.stringify(contextData, null, 2)}`;
    }

    const mistralResponse = await fetchWithTimeout('https://api.mistral.ai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'mistral-small-latest',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: message }
        ],
        max_tokens: 500,
        temperature: 0.7
      }),
      timeoutMs: 30000,
    });

    if (!mistralResponse.ok) {
      const text = await mistralResponse.text();
      console.error('[api] Mistral error', mistralResponse.status, text);
      return NextResponse.json({ error: 'Mistral API error', details: text }, { status: mistralResponse.status });
    }

    const data = await mistralResponse.json();
    const reply = data?.choices?.[0]?.message?.content || '';
    
    return NextResponse.json({ reply });
  } catch (err: any) {
    console.error('[api] Server error:', err);
    return NextResponse.json({ error: 'Server error', details: String(err?.message || err) }, { status: 500 });
  }
}
