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
- Ha a felhasználó grafikont vagy vizualizációt kér (pl. "mutasd grafikonon", "ábrázolja", "töltési árak összehasonlítása", "context-graph"), mindig adj vissza chart kódblokkot JSON-nal (három backtick + "chart" + JSON + három backtick).
- Ha NINCS releváns előre definiált adat, készíts szemléltető/becslésen alapuló egyszerű adatot a kéréshez illeszkedően.
- A JSON séma: { "title": "...", "description": "...", "type": "bar", "data": [{ "name": "...", "value": 123 }], "xAxis": "name", "yAxis": "value", "yAxisLabel": "...", "color": "#009fa9" }

PÉLDA CHART FORMÁTUM (helyettesítsd be a tényleges adatokat):
(három backtick)chart
{
  "title": "Városok népessége",
  "type": "bar",
  "data": [
    { "name": "London", "value": 9 },
    { "name": "Moskva", "value": 12 }
  ],
  "xAxis": "name",
  "yAxis": "value",
  "yAxisLabel": "Népesség (millió fő)",
  "color": "#009fa9"
}
(három backtick)

ELŐRE DEFINIÁLT GRAFIKON ADAT - EV Töltési Árak (használd ezt, ha töltési árakat kérnek):
{
  "title": "EV Töltési Árak Összehasonlítása (2025)",
  "description": "Különböző töltőszolgáltatók átlagos kWh árai Magyarországon",
  "type": "bar",
  "data": [
    { "name": "Mobiliti", "value": 0 },
    { "name": "MOL Plugee", "value": 95 },
    { "name": "E.ON Drive", "value": 115 },
    { "name": "Ionity", "value": 149 },
    { "name": "Tesla Supercharger", "value": 125 },
    { "name": "NKM", "value": 89 }
  ],
  "xAxis": "name",
  "yAxis": "value",
  "yAxisLabel": "Ár (Ft/kWh)",
  "color": "#009fa9"
}`;

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
