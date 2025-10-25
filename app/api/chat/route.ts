import { NextRequest, NextResponse } from 'next/server';
import { createOrGetSession, saveMessage, getChatHistory, updateSessionTimestamp, getContextData } from '@/lib/db';
import { randomBytes } from 'crypto';

// Generate a unique session ID
function generateSessionId(): string {
  return `session_${Date.now()}_${randomBytes(8).toString('hex')}`;
}

async function fetchWithTimeout(resource: string, options: any = {}) {
  const { timeoutMs = 30000, ...rest } = options;
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeoutMs);
  return fetch(resource, { ...rest, signal: controller.signal })
    .finally(() => clearTimeout(id));
}

export async function POST(request: NextRequest) {
  try {
    const { message, sessionId: clientSessionId } = await request.json();
    const apiKey = process.env.AGENT_API_KEY || process.env.MISTRAL_API_KEY || 'iURK1Q2QKWiWpSMQTWveLoSkXhGvsEiv';

    if (!apiKey) {
      return NextResponse.json({ error: 'Missing API key' }, { status: 500 });
    }
    if (!message || typeof message !== 'string') {
      return NextResponse.json({ error: 'Invalid message format' }, { status: 400 });
    }

    // Session management
    const sessionId = clientSessionId || generateSessionId();
    console.log(`[api] Processing message for session: ${sessionId}`);

    // Skip database operations for now to avoid timeout
    console.log('[api] Skipping database operations to avoid timeout');
    
    // Skip context loading for now to avoid timeout
    let contextData = null;
    console.log('[api] Skipping context loading to avoid timeout');
    
    // Build context-aware prompt
    let systemPrompt = `Te vagy Mobi, az e-mobilitási asszisztens. Segítesz az elektromos járművek töltésével, árazással és e-mobilitási kérdésekkel kapcsolatban.

FONTOS: Csak a mellékelt kontextus adatokat használd fel a válaszadáshoz. Ha nincs releváns információ a kontextusban, mondd el, hogy nem tudsz pontos választ adni.`;

    if (contextData) {
      systemPrompt += `\n\nKONTEKSTUS - EV töltési árak Magyarországon (2025. január):\n${JSON.stringify(contextData, null, 2)}`;
      console.log('[api] Context data loaded from PostgreSQL');
    } else {
      console.warn('[api] No context data available from PostgreSQL');
    }

    // Build simple messages array without history
    const messages: any[] = [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: message }
    ];

    const mistralResponse = await fetchWithTimeout('https://api.mistral.ai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'mistral-small-latest',
        messages,
        max_tokens: 500,
        temperature: 0.7
      }),
      timeoutMs: 15000,
    });

    if (!mistralResponse.ok) {
      const text = await mistralResponse.text();
      console.error('[api] Mistral error', mistralResponse.status, text);
      return NextResponse.json({ error: 'Mistral API error', details: text }, { status: mistralResponse.status });
    }

    const data = await mistralResponse.json();
    const reply = data?.choices?.[0]?.message?.content || '';
    
    // Skip database operations for now
    console.log('[api] Skipping database save operations');
    
    return NextResponse.json({ reply, sessionId });
  } catch (err: any) {
    console.error('[api] Server error:', err);
    return NextResponse.json({ error: 'Server error', details: String(err?.message || err) }, { status: 500 });
  }
}
