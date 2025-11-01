# 🌐 MCP System Overview - Model Context Protocol

## 📋 Mi az MCP?

A **Model Context Protocol (MCP)** egy központosított, szinkronizált tudásbázis rendszer, amely lehetővé teszi, hogy különböző AI asszisztensek (Cursor, Warp, stb.) mindig naprakész, megosztott kontextussal rendelkezzenek a projekt aktuális állapotáról.

---

## 🎯 Cél

### Probléma
- Különböző fejlesztők különböző AI eszközöket használnak (Cursor, Warp, GitHub Copilot, stb.)
- Az AI-ok nem látják egymás változtatásait
- Minden AI-nak külön kell elmagyarázni a projekt struktúráját
- Nincs központi, szinkronizált dokumentáció

### Megoldás: MCP Rendszer
- **Központosított dokumentáció:** Minden kontextus `.md` fájlokban tárolva
- **Szinkronizált tudásbázis:** API végponton keresztül (jövőbeli)
- **Real-time frissítések:** Ha egy fejlesztő frissít, minden fejlesztőnél frissül
- **AI-friendly formátum:** Részletes, strukturált markdown dokumentáció

---

## 🏗️ MCP Fájlok Struktúrája

```
Agent/
├── MCP_AGENT_ROOT_CONTEXT.md       # Törzskönyvtár (package.json, .env, stb.)
├── backend/
│   └── MCP_BACKEND_CONTEXT.md      # Backend logika (server, config, openrouter)
├── shared/
│   └── MCP_SHARED_CONTEXT.md       # Shared resources (prompts, knowledge, schemas)
├── frontend/
│   └── MCP_FRONTEND_CONTEXT.md     # Frontend templates (WebApp előkészítés)
└── MCP_SYSTEM_OVERVIEW.md          # Ez a fájl (rendszer áttekintés)
```

---

## 📄 MCP Fájlok Tartalma

### 1. `MCP_AGENT_ROOT_CONTEXT.md`
**Felelősség:** Törzskönyvtár dokumentálása

**Tartalom:**
- Projekt struktúra
- `package.json` scripts és függőségek
- `.env` environment változók
- Legacy fájlok (backward compatibility)
- Indítási folyamat
- Kapcsolódó MCP fájlok linkjei

**Mikor frissítsd:**
- Új npm package telepítése
- Script módosítás (package.json)
- Environment változó hozzáadása
- Projekt struktúra változás

---

### 2. `MCP_BACKEND_CONTEXT.md`
**Felelősség:** Backend logika dokumentálása

**Tartalom:**
- `server.js` - Express szerver, API endpoints, PostgreSQL
- `config.js` - Konfiguráció, environment változók
- `openrouter.js` - OpenRouter API helper funkciók
- Működési folyamatok (startup, chat request)
- Funkciók részletes magyarázata (kód snippet-ekkel)

**Mikor frissítsd:**
- Új API endpoint hozzáadása
- Backend logika módosítás
- Konfiguráció változás
- Új függőség hozzáadása

---

### 3. `MCP_SHARED_CONTEXT.md`
**Felelősség:** Megosztott erőforrások dokumentálása

**Tartalom:**
- `prompts/mobi-system-prompt.txt` - AI system prompt
- `knowledge/context-graph.json` - Grafikon adatok
- `knowledge/main-questions.md` - Gyakori kérdések
- `schemas/chart-schema.json` - Chart JSON schema
- Használati folyamatok

**Mikor frissítsd:**
- System prompt módosítás
- Új knowledge adat hozzáadása
- Schema változás
- Új prompt template létrehozása

---

### 4. `MCP_FRONTEND_CONTEXT.md`
**Felelősség:** Frontend template-ek dokumentálása

**Tartalom:**
- `AIChatWidget.tsx` - Chat widget komponens
- `AIChatPanel.tsx` - Chat wrapper
- `ChartRenderer.tsx` - Grafikon renderelő
- Frontend-backend kommunikáció
- WebApp integráció tervek

**Mikor frissítsd:**
- Frontend komponens módosítás
- Új komponens hozzáadása
- UI/UX változtatás
- WebApp integráció előrehaladás

---

## 🔄 MCP Használati Folyamat (Jelenlegi)

### 1. Fejlesztő A (Cursor) Módosítást Végez

```
1. Fejlesztő A: Módosítja a backend/server.js-t
2. Fejlesztő A: Frissíti a backend/MCP_BACKEND_CONTEXT.md-t
   - Leírja a változtatást
   - Frissíti a kód snippet-eket
   - Frissíti a "Változtatási Történet" szekciót
3. Fejlesztő A: Git commit + push
4. Fejlesztő B: Git pull
5. Fejlesztő B AI (Warp): Beolvassa a frissített MCP fájlt
6. Fejlesztő B AI: Tisztában van a változtatással
```

**Jelenlegi korlát:** Manuális git pull szükséges (nem real-time)

---

## 🚀 MCP Jövőbeli Implementáció (API Végpont)

### Architektúra

```
┌─────────────────┐         ┌─────────────────┐
│  Fejlesztő A    │         │  Fejlesztő B    │
│  (Cursor)       │         │  (Warp)         │
└────────┬────────┘         └────────┬────────┘
         │                           │
         │ POST /mcp/update          │ GET /mcp/sync
         │                           │
         └───────────┬───────────────┘
                     │
         ┌───────────▼────────────┐
         │   MCP API Server       │
         │   (FastAPI + REST)     │
         └───────────┬────────────┘
                     │
         ┌───────────▼────────────┐
         │   PostgreSQL DB        │
         │   (MCP Documents)      │
         └────────────────────────┘
```

### API Endpoints (Tervezett)

#### 1. GET `/mcp/sync` - Szinkronizáció
**Request:**
```bash
GET /mcp/sync?last_sync=2025-11-01T20:00:00Z
```

**Response:**
```json
{
  "updates": [
    {
      "file": "Agent/backend/MCP_BACKEND_CONTEXT.md",
      "content": "...",
      "updated_at": "2025-11-01T20:30:00Z",
      "updated_by": "developer_a"
    }
  ]
}
```

**Mit csinál:** Visszaadja az összes frissítést a `last_sync` időpont óta.

---

#### 2. POST `/mcp/update` - Frissítés
**Request:**
```json
POST /mcp/update
{
  "file": "Agent/backend/MCP_BACKEND_CONTEXT.md",
  "content": "...",
  "developer": "developer_a",
  "commit_message": "Updated server.js documentation"
}
```

**Response:**
```json
{
  "success": true,
  "updated_at": "2025-11-01T20:30:00Z"
}
```

**Mit csinál:** Frissíti az MCP fájlt a szerveren és értesíti a többi fejlesztőt.

---

#### 3. WebSocket `/mcp/watch` - Real-time Frissítések
**Connection:**
```javascript
const ws = new WebSocket('ws://mcp-api.mobilien.app/mcp/watch');

ws.onmessage = (event) => {
  const update = JSON.parse(event.data);
  // Frissítsd a lokális MCP fájlt
  fs.writeFileSync(update.file, update.content);
};
```

**Mit csinál:** Real-time értesítések, amikor egy MCP fájl frissül.

---

### Implementációs Lépések

#### 1. FastAPI Backend Létrehozása
```python
# mcp-api/main.py
from fastapi import FastAPI, WebSocket
from datetime import datetime

app = FastAPI()

@app.get("/mcp/sync")
async def sync_mcp(last_sync: datetime):
    # Lekéri a frissítéseket a DB-ből
    updates = db.get_updates_since(last_sync)
    return {"updates": updates}

@app.post("/mcp/update")
async def update_mcp(file: str, content: str, developer: str):
    # Frissíti a DB-t
    db.update_mcp_file(file, content, developer)
    # Értesíti a WebSocket client-eket
    await notify_clients(file, content)
    return {"success": True}

@app.websocket("/mcp/watch")
async def websocket_endpoint(websocket: WebSocket):
    await websocket.accept()
    # Real-time frissítések küldése
    ...
```

#### 2. PostgreSQL Schema
```sql
CREATE TABLE mcp_documents (
  id SERIAL PRIMARY KEY,
  file_path TEXT NOT NULL UNIQUE,
  content TEXT NOT NULL,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_by TEXT NOT NULL,
  commit_message TEXT
);

CREATE INDEX idx_mcp_updated_at ON mcp_documents(updated_at);
```

#### 3. Client-side Sync Script
```bash
# mcp-sync.sh (minden fejlesztő lokálisan futtatja)
#!/bin/bash

LAST_SYNC=$(cat .mcp_last_sync)
UPDATES=$(curl "http://mcp-api.mobilien.app/mcp/sync?last_sync=$LAST_SYNC")

# Frissítsd a lokális fájlokat
echo "$UPDATES" | jq -r '.updates[] | "\(.file)|\(.content)"' | while IFS='|' read -r file content; do
  echo "$content" > "$file"
  echo "Updated: $file"
done

# Frissítsd a last_sync timestamp-et
date -u +"%Y-%m-%dT%H:%M:%SZ" > .mcp_last_sync
```

#### 4. IDE Plugin (Cursor, Warp)
```javascript
// Cursor/Warp plugin
const MCPSync = {
  async init() {
    // WebSocket connection
    this.ws = new WebSocket('ws://mcp-api.mobilien.app/mcp/watch');
    
    this.ws.onmessage = (event) => {
      const update = JSON.parse(event.data);
      // Frissítsd a lokális fájlt
      fs.writeFileSync(update.file, update.content);
      // Értesítsd az AI-t
      this.notifyAI(`MCP file updated: ${update.file}`);
    };
  },
  
  async pushUpdate(file, content) {
    await fetch('http://mcp-api.mobilien.app/mcp/update', {
      method: 'POST',
      body: JSON.stringify({ file, content, developer: 'developer_a' })
    });
  }
};
```

---

## 🔐 Biztonsági Megfontolások

### 1. Authentikáció
- **API Key:** Minden fejlesztő kap egy egyedi API key-t
- **JWT Token:** Session-alapú authentikáció

### 2. Authorizáció
- **Read Access:** Minden fejlesztő olvashat minden MCP fájlt
- **Write Access:** Csak a saját projekt mappájában írhat
- **Admin Access:** Project owner mindent módosíthat

### 3. Verziókezelés
- **Git Integration:** MCP frissítések automatikusan commitolva
- **Conflict Resolution:** Ha két fejlesztő egyszerre frissít, merge conflict kezelés

---

## 📊 MCP Előnyei

### 1. Központosított Tudásbázis
✅ Minden AI ugyanazt a dokumentációt látja  
✅ Nincs információ fragmentáció  
✅ Egyetlen forrás az igazsághoz (Single Source of Truth)

### 2. Real-time Szinkronizáció
✅ Fejlesztő A változtatása azonnal látható Fejlesztő B-nél  
✅ Nincs szükség manuális git pull-ra  
✅ WebSocket-alapú push értesítések

### 3. AI-Friendly Formátum
✅ Strukturált markdown  
✅ Kód snippet-ek  
✅ Részletes magyarázatok  
✅ Kapcsolódó fájlok linkjei

### 4. Team Collaboration
✅ Több fejlesztő párhuzamosan dolgozhat  
✅ Változtatások követhetők  
✅ Conflict resolution

---

## 📝 Best Practices

### 1. MCP Fájl Frissítése
```markdown
## 📝 Változtatási Történet

### 2025. november 1. - v2.0.1
- ✅ Új API endpoint: POST /api/newsletter
- ✅ Session management implementálva
- ✅ PostgreSQL context betöltés optimalizálva
```

**Mindig add hozzá:**
- Dátum
- Verzió
- Változtatások listája (checkbox-okkal)

### 2. Kód Snippet-ek
```markdown
**`functionName()` - Funkció Leírása**

\`\`\`javascript
async function functionName(param1, param2) {
  // Implementation
  return result;
}
\`\`\`

**Mit csinál:** Részletes magyarázat...
```

**Mindig add meg:**
- Funkció név és paraméterek
- Kód snippet
- "Mit csinál" magyarázat

### 3. Kapcsolódó Fájlok
```markdown
## 🔗 Kapcsolódó Fájlok

- **[../backend/server.js](../backend/server.js)** - Backend szerver
- **[MCP_SHARED_CONTEXT.md](../shared/MCP_SHARED_CONTEXT.md)** - Shared resources
```

**Mindig linkeld:**
- Kapcsolódó kód fájlokat
- Kapcsolódó MCP fájlokat
- Külső dokumentációt

---

## 🎯 Következő Lépések

### Fázis 1: Jelenlegi (✅ Kész)
- ✅ MCP fájlok létrehozása
- ✅ Dokumentáció megírása
- ✅ Git commit + push

### Fázis 2: API Backend (⏳ Tervezett)
- ⏳ FastAPI backend implementáció
- ⏳ PostgreSQL schema létrehozása
- ⏳ API endpoints implementálása
- ⏳ WebSocket real-time frissítések

### Fázis 3: Client-side Sync (⏳ Tervezett)
- ⏳ Sync script létrehozása
- ⏳ IDE plugin (Cursor, Warp)
- ⏳ Automatikus frissítések

### Fázis 4: Production Deployment (⏳ Tervezett)
- ⏳ MCP API hosting (Vercel, Railway, stb.)
- ⏳ PostgreSQL database setup
- ⏳ Monitoring és logging

---

## 📚 További Információk

- **[MCP_AGENT_ROOT_CONTEXT.md](MCP_AGENT_ROOT_CONTEXT.md)** - Törzskönyvtár dokumentáció
- **[backend/MCP_BACKEND_CONTEXT.md](backend/MCP_BACKEND_CONTEXT.md)** - Backend dokumentáció
- **[shared/MCP_SHARED_CONTEXT.md](shared/MCP_SHARED_CONTEXT.md)** - Shared resources dokumentáció
- **[frontend/MCP_FRONTEND_CONTEXT.md](frontend/MCP_FRONTEND_CONTEXT.md)** - Frontend dokumentáció

---

**Készítette:** Mobilien Team  
**Utolsó frissítés:** 2025. november 1.  
**Verzió:** 1.0.0 (MCP System)

