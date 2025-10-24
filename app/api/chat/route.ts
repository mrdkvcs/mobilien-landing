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

    // Create or get session from database
    await createOrGetSession(sessionId);

    // Save user message to database
    await saveMessage(sessionId, 'user', message);

    // Get chat history (last 10 messages for context)
    const history = await getChatHistory(sessionId, 10);
    
    // Load context data from PostgreSQL
    const contextData = await getContextData('charging_prices', 'hungary_2025');
    
    // Build context-aware prompt
    let systemPrompt = `Te vagy Mobi, az e-mobilitási asszisztens. Segítesz az elektromos járművek töltésével, árazással és e-mobilitási kérdésekkel kapcsolatban.

FONTOS: Csak a mellékelt kontextus adatokat használd fel a válaszadáshoz. Ha nincs releváns információ a kontextusban, mondd el, hogy nem tudsz pontos választ adni.`;

    if (contextData) {
      systemPrompt += `\n\nKONTEKSTUS - EV töltési árak Magyarországon (2025. január):\n${JSON.stringify(contextData, null, 2)}`;
      console.log('[api] Context data loaded from PostgreSQL');
    } else {
      console.warn('[api] No context data available from PostgreSQL');
    }

    // Build messages array with history
    const messages: any[] = [{ role: 'system', content: systemPrompt }];
    
    // Add chat history (excluding the last user message we just saved)
    if (history.length > 0) {
      const historyMessages = history
        .slice(0, -1) // Exclude the last message (current user message)
        .map((msg: any) => ({
          role: msg.role,
          content: msg.content
        }));
      messages.push(...historyMessages);
    }
    
    // Add current user message
    messages.push({ role: 'user', content: message });

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
      timeoutMs: 30000,
    });

    if (!mistralResponse.ok) {
      const text = await mistralResponse.text();
      console.error('[api] Mistral error', mistralResponse.status, text);
      return NextResponse.json({ error: 'Mistral API error', details: text }, { status: mistralResponse.status });
    }

    const data = await mistralResponse.json();
    const reply = data?.choices?.[0]?.message?.content || '';
    
    // Save assistant reply to database
    await saveMessage(sessionId, 'assistant', reply);
    
    // Update session timestamp
    await updateSessionTimestamp(sessionId);
    
    return NextResponse.json({ reply, sessionId });
  } catch (err: any) {
    console.error('[api] Server error:', err);
    return NextResponse.json({ error: 'Server error', details: String(err?.message || err) }, { status: 500 });
  }
}
