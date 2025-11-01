# 🔧 MCP Context: Backend

## 📋 Meta Információ
**Fájl célja:** Ez egy Model Context Protocol (MCP) dokumentációs fájl, amely a Mobilien AI Agent backend logikájának aktuális állapotát, struktúráját és funkcionalitását dokumentálja. AI asszisztensek számára biztosít központosított, szinkronizált tudásbázist.

**Szinkronizáció:** Jövőbeli cél, hogy ez a fájl API végponton keresztül (FastAPI + REST API vagy hasonló) hostolva legyen, így ha egy fejlesztő frissíti, akkor a másik fejlesztő ugyanazon projektmappájában lévő .md fájl is automatikusan frissül. Így minden AI asszisztens mindig naprakész, megosztott tudásbázissal rendelkezik.

**Utolsó frissítés:** 2025. november 1.  
**Verzió:** 2.0.0  
**Projekt:** Mobilien AI Agent - Backend Module

---

## 🏗️ Backend Struktúra

```
Agent/backend/
├── server.js           # Fő Express szerver
├── config.js           # Konfiguráció és environment változók
└── openrouter.js       # OpenRouter API helper module
```

---

## 📄 Fájlok Részletes Leírása

### 1. `server.js` - Fő Express Szerver

**Felelősség:** Az Agent backend központi szerverlogikája. Kezeli az API endpoint-okat, PostgreSQL kapcsolatot, és az OpenRouter API hívásokat.

#### Importok és Függőségek
```javascript
const express = require('express');          // Web framework
const cors = require('cors');                // CORS middleware
const fs = require('fs');                    // File system (prompt/context betöltés)
const path = require('path');                // Path kezelés
const config = require('./config');          // Konfiguráció
const openrouter = require('./openrouter');  // OpenRouter API helper
const { Pool } = require('pg');              // PostgreSQL client
```

#### Inicializáció
```javascript
const app = express();
const PORT = config.server.port;  // Default: 3000

const pool = new Pool({
  connectionString: config.database.connectionString,
  ssl: config.database.ssl
});
```

**Mit csinál:**
- Express app létrehozása
- PostgreSQL connection pool inicializálása
- Port beállítása (environment változóból vagy default 3000)

#### PostgreSQL Táblák

**1. `newsletter_subscriptions` tábla**
```sql
CREATE TABLE IF NOT EXISTS newsletter_subscriptions (
  id SERIAL PRIMARY KEY,
  email TEXT NOT NULL UNIQUE,
  source TEXT,
  ip_address TEXT,
  user_agent TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

**Mit csinál:** Newsletter feliratkozások tárolása. Az app indulásakor automatikusan létrehozza, ha nem létezik.

**2. `context_data` tábla** (migrations/002_create_context_table.sql)
```sql
-- Kontextus adatok tárolása (EV töltési árak, stb.)
SELECT data FROM context_data 
WHERE category = 'charging_prices' AND key_name = 'hungary_2025'
```

#### Funkciók

**`loadContext()` - Kontextus betöltése PostgreSQL-ből**
```javascript
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
```

**Mit csinál:** EV töltési árak kontextusát tölti be a PostgreSQL-ből. Ha nincs adat, null-t ad vissza és warning-ot log-ol.

**System Prompt Betöltése Fájlból**
```javascript
let systemPromptTemplate = '';
try {
  const promptPath = path.join(__dirname, '../shared/prompts/mobi-system-prompt.txt');
  if (fs.existsSync(promptPath)) {
    systemPromptTemplate = fs.readFileSync(promptPath, 'utf8');
    console.log('[server] System prompt template loaded');
  } else {
    console.error('[server] System prompt file not found at:', promptPath);
  }
} catch (error) {
  console.error('[server] Failed to load system prompt:', error.message);
}
```

**Mit csinál:** 
- Betölti a system prompt template-et a `../shared/prompts/mobi-system-prompt.txt` fájlból
- Ha nem találja, error-t log-ol
- A template tartalmaz egy `{{GRAPH_CONTEXT}}` placeholder-t, amit később helyettesítünk

**Graph Context Betöltése**
```javascript
let graphContext = null;
try {
  const graphPath = path.join(__dirname, '../shared/knowledge/context-graph.json');
  if (fs.existsSync(graphPath)) {
    graphContext = JSON.parse(fs.readFileSync(graphPath, 'utf8'));
    console.log('[server] Graph context loaded from file');
  }
} catch (error) {
  console.error('[server] Failed to load graph context:', error.message);
}
```

**Mit csinál:** Betölti az előre definiált grafikon adatokat (EV töltési árak) a `../shared/knowledge/context-graph.json` fájlból.

#### Middleware

```javascript
app.use(cors({
  origin: config.server.corsOrigins,  // Engedélyezett origin-ek
  credentials: true,
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());  // JSON body parsing
```

**Mit csinál:** 
- CORS beállítások (production origin-ek: mobilien.app, localhost)
- JSON request body parsing

#### API Endpoints

**1. GET `/health` - Health Check**
```javascript
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});
```

**Request:** `GET http://localhost:3000/health`  
**Response:** `{"status":"ok","timestamp":"2025-11-01T20:00:00.000Z"}`

**Mit csinál:** Egyszerű health check endpoint. Ellenőrzi, hogy a szerver fut-e.

---

**2. POST `/api/newsletter` - Newsletter Feliratkozás**
```javascript
app.post('/api/newsletter', async (req, res) => {
  const { email, source } = req.body;
  
  // Email validáció
  const normalizedEmail = String(email).trim().toLowerCase();
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  
  // IP cím kinyerése (X-Forwarded-For, CF-Connecting-IP, stb.)
  // User agent kinyerése
  
  // PostgreSQL INSERT (ON CONFLICT DO UPDATE)
  const result = await pool.query(
    `INSERT INTO newsletter_subscriptions (email, source, ip_address, user_agent)
     VALUES ($1, $2, $3, $4)
     ON CONFLICT (email) DO UPDATE
       SET source = COALESCE(EXCLUDED.source, newsletter_subscriptions.source),
           updated_at = NOW()
     RETURNING id, email, created_at`,
    [normalizedEmail, source || null, ipAddress || null, userAgent || null]
  );
  
  return res.status(201).json({ success: true, id: result.rows[0].id });
});
```

**Request:**
```json
POST /api/newsletter
{
  "email": "user@example.com",
  "source": "homepage"
}
```

**Response:**
```json
{
  "success": true,
  "id": 123
}
```

**Mit csinál:**
1. Email validáció (regex)
2. Email normalizálás (lowercase, trim)
3. IP cím és User-Agent kinyerése a request header-ekből
4. PostgreSQL-be mentés (ON CONFLICT DO UPDATE = ha már létezik, frissíti)
5. Visszaadja a létrehozott/frissített rekord ID-jét

---

**3. POST `/api/chat` - AI Chat Endpoint**
```javascript
app.post('/api/chat', async (req, res) => {
  const { message } = req.body;
  
  // Validáció
  if (!message || typeof message !== 'string') {
    return res.status(400).json({ error: 'Invalid message format' });
  }
  
  // System prompt építése
  let systemPrompt = systemPromptTemplate.replace(
    '{{GRAPH_CONTEXT}}',
    JSON.stringify(graphContext, null, 2)
  );
  
  // Context hozzáadása (ha van PostgreSQL-ben)
  if (contextData) {
    systemPrompt += `\n\nKONTEXTUS - EV töltési árak:\n${JSON.stringify(contextData, null, 2)}`;
  }
  
  // OpenRouter API hívás
  const messages = [
    openrouter.systemMessage(systemPrompt),
    openrouter.userMessage(message)
  ];
  
  const response = await openrouter.chatCompletion(messages, {
    min_tokens: 500,
    max_tokens: 2000,
    temperature: 0.7
  });
  
  const reply = openrouter.getReplyText(response) || 'Sajnálom, nem tudok válaszolni.';
  
  res.json({ reply });
});
```

**Request:**
```json
POST /api/chat
{
  "message": "Mennyibe kerül a töltés?"
}
```

**Response:**
```json
{
  "reply": "A Mobiliti töltés teljesen ingyenes..."
}
```

**Mit csinál:**
1. **Validáció:** Ellenőrzi, hogy a message string-e
2. **System Prompt Építés:**
   - Template betöltése (`systemPromptTemplate`)
   - `{{GRAPH_CONTEXT}}` placeholder helyettesítése a `graphContext` JSON-nel
   - PostgreSQL context hozzáadása (ha van)
3. **OpenRouter API Hívás:**
   - Messages array: system prompt + user message
   - Paraméterek: min_tokens=500, max_tokens=2000, temperature=0.7
4. **Válasz Visszaadása:** AI válasz JSON-ben

**Hibakezelés:**
- 400: Invalid message format
- 500: Missing API key, Server error

---

#### Szerver Indítás

```javascript
app.listen(PORT, () => {
  console.log(`[server] 🚀 Mobilien AI Agent listening on http://localhost:${PORT}`);
  console.log(`[server] 💬 API endpoint: http://localhost:${PORT}/api/chat`);
  console.log(`[server] ✉️ Newsletter endpoint: http://localhost:${PORT}/api/newsletter`);
  console.log(`[server] 🤖 Model: ${config.openrouter.model}`);
  console.log(`[server] ✅ Ready to serve requests!`);
});
```

**Mit csinál:** Express szerver indítása a megadott PORT-on (default: 3000). Console-ra ír hasznos információkat.

---

### 2. `config.js` - Konfiguráció

**Felelősség:** Központosított konfiguráció és environment változók betöltése.

```javascript
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const config = {
  openrouter: {
    apiKey: process.env.OPENROUTER_API_KEY || process.env.AGENT_API_KEY,
    baseUrl: 'https://openrouter.ai/api/v1',
    model: process.env.GPT_MODEL || 'openai/gpt-4-turbo',
    defaultMaxTokens: 2000,
    defaultTemperature: 0.7,
  },
  
  database: {
    connectionString: process.env.DATABASE_URL,
    ssl: false,
  },
  
  server: {
    port: process.env.PORT || 3000,
    corsOrigins: [
      'https://mobilien.app',
      'https://www.mobilien.app',
      'https://mobilien.hu',
      'https://www.mobilien.hu',
      'http://localhost:8000',
      'http://localhost:3000'
    ],
  },
  
  availableModels: {
    'gpt-4-turbo': 'openai/gpt-4-turbo',
    'gpt-4': 'openai/gpt-4',
    'gpt-3.5-turbo': 'openai/gpt-3.5-turbo',
    'gpt-4o': 'openai/gpt-4o',
    'gpt-4o-mini': 'openai/gpt-4o-mini',
  },
};

// Validáció
if (!config.openrouter.apiKey) {
  console.warn('[config] WARNING: OPENROUTER_API_KEY not found');
} else {
  console.log('[config] ✅ OpenRouter API key configured');
  console.log('[config] 🤖 Using model:', config.openrouter.model);
}

module.exports = config;
```

**Mit csinál:**
1. **`.env` Betöltés:** `dotenv` használatával betölti a `../. env` fájlt
2. **Config Object:** Központosított konfiguráció objektum
3. **Validáció:** Ellenőrzi, hogy az API key be van-e állítva
4. **Export:** Exportálja a config objektumot

**Fontos:** A `.env` fájl a `backend/` mappa **fölött** van (`Agent/.env`), ezért `../. env` az elérési út.

---

### 3. `openrouter.js` - OpenRouter API Helper

**Felelősség:** OpenRouter API hívások kezelése, helper funkciók.

#### Főbb Funkciók

**`chatCompletion(messages, options)` - Chat Completion API hívás**
```javascript
async function chatCompletion(messages, options = {}) {
  const {
    model = config.openrouter.model,
    max_tokens = config.openrouter.defaultMaxTokens,
    min_tokens,  // Opcionális
    temperature = config.openrouter.defaultTemperature,
    timeout = 30000,
  } = options;

  const requestBody = {
    model,
    messages,
    max_tokens,
    temperature,
  };

  if (min_tokens) {
    requestBody.min_tokens = min_tokens;
  }

  const response = await axios.post(
    `${config.openrouter.baseUrl}/chat/completions`,
    requestBody,
    {
      headers: {
        'Authorization': `Bearer ${config.openrouter.apiKey}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': 'https://mobilien.app',
        'X-Title': 'Mobilien AI Agent',
      },
      timeout,
    }
  );

  return response.data;
}
```

**Paraméterek:**
- `messages`: Array of message objects `[{ role: 'system'|'user'|'assistant', content: string }]`
- `options`: 
  - `model`: GPT model neve (default: config-ból)
  - `max_tokens`: Max token limit (default: 2000)
  - `min_tokens`: Min token limit (opcionális, v2.0.0-ban hozzáadva)
  - `temperature`: Kreativitás (default: 0.7)
  - `timeout`: HTTP timeout ms-ben (default: 30000)

**Visszatérési érték:** OpenRouter API response object

**Hibakezelés:**
- API error (4xx, 5xx): `OpenRouter API error (status): {...}`
- Timeout/Network error: `OpenRouter API timeout or network error`
- Request setup error: `OpenRouter request setup error`

---

**Helper Funkciók:**

```javascript
// Válasz szöveg kinyerése
function getReplyText(response) {
  return response?.choices?.[0]?.message?.content || '';
}

// Message objektum létrehozók
function systemMessage(content) {
  return { role: 'system', content };
}

function userMessage(content) {
  return { role: 'user', content };
}

function assistantMessage(content) {
  return { role: 'assistant', content };
}

// Egyszerű chat építő
function buildSimpleChat(systemPrompt, userMsg) {
  return [
    systemMessage(systemPrompt),
    userMessage(userMsg)
  ];
}
```

**Exportált Funkciók:**
```javascript
module.exports = {
  chatCompletion,
  getReplyText,
  systemMessage,
  userMessage,
  assistantMessage,
  buildSimpleChat,
};
```

---

## 🔄 Működési Folyamat

### 1. Szerver Indítás
```
1. server.js betöltődik
2. config.js betölti a .env fájlt
3. PostgreSQL connection pool létrejön
4. newsletter_subscriptions tábla létrehozása (ha nem létezik)
5. System prompt betöltése (../shared/prompts/mobi-system-prompt.txt)
6. Graph context betöltése (../shared/knowledge/context-graph.json)
7. PostgreSQL context betöltése (loadContext())
8. Middleware-ek inicializálása (CORS, JSON parsing)
9. Routes regisztrálása (/health, /api/newsletter, /api/chat)
10. Express szerver listen (PORT 3000)
```

### 2. Chat Request Folyamat
```
1. POST /api/chat érkezik { message: "..." }
2. Validáció (message string-e?)
3. System prompt építése:
   a. Template betöltése
   b. {{GRAPH_CONTEXT}} helyettesítése
   c. PostgreSQL context hozzáadása (ha van)
4. Messages array létrehozása [system, user]
5. openrouter.chatCompletion() hívás
6. OpenRouter API request (axios POST)
7. Response feldolgozása
8. Reply kinyerése (getReplyText)
9. JSON response küldése { reply: "..." }
```

---

## 🔗 Kapcsolódó Fájlok

- **[../shared/prompts/mobi-system-prompt.txt](../shared/prompts/mobi-system-prompt.txt)** - System prompt template
- **[../shared/knowledge/context-graph.json](../shared/knowledge/context-graph.json)** - Grafikon adatok
- **[../. env](../. env)** - Environment változók
- **[MCP_SHARED_CONTEXT.md](../shared/MCP_SHARED_CONTEXT.md)** - Shared resources dokumentáció

---

## 📝 Változtatási Történet

### 2025. november 1. - v2.0.0
- ✅ Backend mappa létrehozása
- ✅ System prompt fájlból való betöltés
- ✅ Graph context fájlból való betöltés
- ✅ `min_tokens` paraméter támogatás (openrouter.js)
- ✅ Config frissítése (../. env elérési út)

---

**Megjegyzés:** Ez a dokumentum automatikusan szinkronizálódik a team tagok között (jövőbeli MCP API implementáció után).

