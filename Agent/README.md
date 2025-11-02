# 🤖 Mobilien AI Agent (Mobi)

Mobi az e-mobilitási asszisztens, amely segít az elektromos járművek töltésével, árazással és e-mobilitási kérdésekkel kapcsolatban.

## 📁 Projekt Struktúra

```
Agent/
├── backend/                    # Backend logika (Node.js + Express)
│   ├── server.js              # Fő szerver fájl
│   ├── config.js              # Konfiguráció
│   └── openrouter.js          # OpenRouter API helper
│
├── shared/                     # Megosztott erőforrások
│   ├── prompts/               # AI system prompt-ok
│   │   └── mobi-system-prompt.txt
│   ├── knowledge/             # Tudásbázis
│   │   ├── context-graph.json
│   │   └── main-questions.md
│   └── schemas/               # JSON sémák
│       └── chart-schema.json
│
├── frontend/                   # Frontend komponensek
│   ├── webpage/               # Weboldal komponensek (működő)
│   │   ├── AIChatWidget.tsx
│   │   ├── AIChatPanel.tsx
│   │   ├── ChartRenderer.tsx
│   │   └── README.md
│   ├── webapp/                # WebApp komponensek (jövőbeli, üres)
│   │   └── README.md
│   └── templates/            # Általános dokumentáció
│       └── README.md
│
├── migrations/                 # Adatbázis migrációk
│   └── 002_create_context_table.sql
│
├── .env                       # Environment változók
├── package.json               # Node.js függőségek
└── README.md                  # Ez a fájl
```

## 🚀 Gyors Kezdés

### 1. Telepítés

```bash
cd Agent
npm install
```

### 2. Environment beállítása

Hozz létre egy `.env` fájlt az `Agent/` mappában:

```env
# OpenRouter API
OPENROUTER_API_KEY=sk-or-v1-your-api-key-here
GPT_MODEL=openai/gpt-oss-20b:free

# Database
DATABASE_URL=postgresql://user:password@host:5432/database

# Server
PORT=3000

# Note: MCP fájlok automatikusan szinkronizálva vannak a Nextcloud Desktop Client-tel
# A knowledge_base/MCP/ mappa a Shared/MCP mappával van szinkronizálva
```

### 3. Szerver indítása

```bash
# Development mode (nodemon)
npm run dev

# Production mode
npm start
```

## 📡 API Endpoints

### Chat Endpoint
**POST** `/api/chat`

Request:
```json
{
  "message": "Mennyibe kerül a töltés?"
}
```

Response:
```json
{
  "reply": "A Mobiliti töltés teljesen ingyenes..."
}
```

### Newsletter Endpoint
**POST** `/api/newsletter`

Request:
```json
{
  "email": "user@example.com",
  "source": "homepage"
}
```

Response:
```json
{
  "success": true,
  "id": 123
}
```

### Health Check
**GET** `/health`

Response:
```json
{
  "status": "ok",
  "timestamp": "2025-11-01T20:00:00.000Z"
}
```

## 🧠 AI System Prompt

A Mobi system prompt-ja a `shared/prompts/mobi-system-prompt.txt` fájlban található. Ez a fájl határozza meg:
- Mobi személyiségét és viselkedését
- Válasz formázási szabályokat (Markdown, táblázatok)
- Grafikon generálási utasításokat
- Kontextus használati szabályokat

**Módosítás:** Szerkeszd a `mobi-system-prompt.txt` fájlt, majd indítsd újra a szervert.

## 📊 Tudásbázis

### Knowledge Base
A `shared/knowledge/` mappa tartalmazza:
- **context-graph.json**: Előre definiált grafikon adatok (pl. EV töltési árak)
- **main-questions.md**: Top 10 gyakori kérdés magyar EV felhasználóktól

### Tudásbázis bővítése
1. Adj hozzá új JSON fájlokat a `shared/knowledge/` mappához
2. Frissítsd a `backend/server.js`-t az új adatok betöltéséhez
3. Módosítsd a system prompt-ot, ha szükséges

## 🎨 Frontend Integráció

A frontend komponensek a `frontend/webpage/` mappában találhatók (weboldal) és a `frontend/webapp/` mappában (jövőbeli WebApp). Részletek:
- [Webpage README](frontend/webpage/README.md) - Weboldal komponensek
- [WebApp README](frontend/webapp/README.md) - WebApp tervek
- [Frontend MCP Context](frontend/MCP_FRONTEND_CONTEXT.md) - Teljes frontend dokumentáció

### Szükséges npm package-ek (frontend):
```bash
npm install react-markdown remark-gfm recharts lucide-react
npm install -D @tailwindcss/typography
```

## 🔧 Konfiguráció

### Elérhető modellek (OpenRouter)
- `openai/gpt-oss-20b:free` (ingyenes, rate limited)
- `openai/gpt-4o-mini` (fizetős, gyors)
- `openai/gpt-4-turbo` (fizetős, legjobb minőség)

Módosítsd a `GPT_MODEL` változót a `.env` fájlban.

### CORS beállítások
A `backend/config.js` fájlban állíthatod be az engedélyezett origin-eket:
```javascript
corsOrigins: [
  'https://mobilien.app',
  'https://www.mobilien.app',
  'http://localhost:3000'
]
```

## 🐳 Docker Deployment

```bash
# Build
docker build -t mobilien-agent .

# Run
docker run -p 3000:3000 --env-file .env mobilien-agent
```

## 📝 Scripts

```bash
npm start        # Start production server
npm run dev      # Start development server (nodemon)
npm test         # Run tests (if available)
```

## 🔄 Jövőbeli Fejlesztések

- [ ] Session management PostgreSQL-ben
- [ ] Multi-platform support (WebApp + Website)
- [ ] Function calling / Tool use
- [ ] Real-time töltőállomás adatok integráció
- [ ] Útvonaltervezés EV-kkel
- [ ] Felhasználói statisztikák és dashboard

## 📚 Dokumentáció

- [Frontend Templates](frontend/templates/README.md) - Frontend komponensek

## 🤝 Hozzájárulás

1. Fork the repo
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Open a Pull Request

## 📄 Licenc

Proprietary - Mobilien.app

---

**Készítette:** Mobilien Team  
**Utolsó frissítés:** 2025. november 1.
