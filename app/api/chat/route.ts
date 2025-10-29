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

FONTOS: Elsődlegesen a mellékelt kontextus adatokat használd fel a válaszadáshoz. Ha a kontextusban nincs releváns információ, akkor a saját tudásodat használd és válaszolj a kérdésre.

VÁLASZ HOSSZA: Legyél tömör és lényegretörő. Egyszerű kérdésekre adj rövid választ (1-2 mondat). Csak komplex vagy összetett kérdések esetén adj részletes magyarázatot táblázatokkal és listákkal.

FORMÁZÁS: Használj Markdown formázást a válaszaidban:
- **Félkövér** fontos információkhoz
- Táblázatok összehasonlításokhoz és árakhoz
- Listák (bullet points) felsorolásokhoz
- Címsorok (##) a struktúráláshoz

GRAFIKON MEGJELENÍTÉS:
- Ha a felhasználó grafikont vagy vizualizációt kér (pl. "mutasd grafikonon", "ábrázolja", "context-graph", "EV töltési árak"), MINDIG adj vissza chart kódblokkot JSON-nal (három backtick + "chart" + JSON + három backtick).
- Ha "context-graph" vagy "EV töltési árak" kérés érkezik, akkor PONTOSAN a lenti ELÉRHETŐ KONTEXTUS GRAFIKON ADAT-ot másold be a chart blokkba, változtatás nélkül!
- Ha más grafikon kérés érkezik (pl. városok, népesség), készíts egyszerű adatot, de használd a helyes sémát: a data tömbben minden objektumnak legyen "name" és az yAxis szerinti mezője (pl. "value", "price", stb.)

FONTOS: A chart JSON-ban az yAxis mező neve határozza meg, hogy melyik adatmezőt rajzolja ki. Pl. ha yAxis="price", akkor a data-ban "price" mezőnek kell lennie.

ELÉRHETŐ KONTEXTUS GRAFIKON ADAT (EV töltési árak):
{
  "graphId": "ev-charging-prices-comparison",
  "title": "EV Töltési Árak Összehasonlítása (2025)",
  "description": "Különböző töltőszolgáltatók átlagos kWh árai Magyarországon",
  "type": "bar",
  "data": [
    { "name": "Mobiliti", "price": 0 },
    { "name": "MOL Plugee", "price": 95 },
    { "name": "E.ON Drive", "price": 115 },
    { "name": "Ionity", "price": 149 },
    { "name": "Tesla Supercharger", "price": 125 },
    { "name": "NKM", "price": 89 }
  ],
  "xAxis": "name",
  "yAxis": "price",
  "yAxisLabel": "Ár (Ft/kWh)",
  "color": "#009fa9"
}

Ha "context-graph" vagy "töltési árak" kérés jön, másold be PONTOSAN ezt a JSON-t a chart blokkba (három backtick)chart és (három backtick) közé!`;

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
        min_tokens: 250,
        max_tokens: 2000,
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
