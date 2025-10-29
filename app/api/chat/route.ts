import { NextRequest, NextResponse } from 'next/server';
import { randomBytes } from 'crypto';

// Generate a unique session ID
function generateSessionId(): string {
  return `session_${Date.now()}_${randomBytes(8).toString('hex')}`;
}

export async function POST(request: NextRequest) {
  try {
    const { message, sessionId: clientSessionId } = await request.json();
    
    // Get OpenRouter API key from environment
    const apiKey = process.env.OPENROUTER_API_KEY || process.env.AGENT_API_KEY;

    if (!apiKey) {
      return NextResponse.json({ error: 'Missing OpenRouter API key' }, { status: 500 });
    }
    if (!message || typeof message !== 'string') {
      return NextResponse.json({ error: 'Invalid message format' }, { status: 400 });
    }

    // Session management
    const sessionId = clientSessionId || generateSessionId();
    console.log(`[api] Processing message for session: ${sessionId}`);
    
    // Build system prompt
    const systemPrompt = `Te vagy Mobi, az e-mobilitási asszisztens. Segítesz az elektromos járművek töltésével, árazással és e-mobilitási kérdésekkel kapcsolatban.

FONTOS: Csak a mellékelt kontextus adatokat használd fel a válaszadáshoz. Ha nincs releváns információ a kontextusban, mondd el, hogy nem tudsz pontos választ adni.`;

    const messages: any[] = [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: message }
    ];

    // Call OpenRouter API
    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': 'https://mobilien.app',
        'X-Title': 'Mobilien AI Agent',
      },
      body: JSON.stringify({
        model: process.env.GPT_MODEL || 'openai/gpt-oss-20b:free',
        messages,
        max_tokens: 500,
        temperature: 0.7
      }),
    });

    if (!response.ok) {
      const text = await response.text();
      console.error('[api] OpenRouter error', response.status, text);
      return NextResponse.json({ error: 'OpenRouter API error', details: text }, { status: response.status });
    }

    const data = await response.json();
    const reply = data?.choices?.[0]?.message?.content || '';
    
    console.log('[api] OpenRouter response received, tokens:', data.usage?.total_tokens || 'N/A');
    
    return NextResponse.json({ reply, sessionId });
  } catch (err: any) {
    console.error('[api] Server error:', err);
    return NextResponse.json({ error: 'Server error', details: String(err?.message || err) }, { status: 500 });
  }
}
