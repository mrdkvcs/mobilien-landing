# 🤖 MCP Context: Agent Root (Törzskönyvtár)

## 📋 Meta Információ
**Fájl célja:** Ez egy Model Context Protocol (MCP) dokumentációs fájl, amely központosított, szinkronizált tudásbázist biztosít AI asszisztensek számára. A fájl tartalmazza az Agent projekt törzskönyvtárának aktuális állapotát, struktúráját és funkcionalitását.

**Szinkronizáció:** Jövőbeli cél, hogy ez a fájl API végponton keresztül (FastAPI + REST API vagy hasonló) hostolva legyen, így ha egy fejlesztő (pl. Cursor használó) frissíti, akkor a másik fejlesztő (pl. Warp használó) ugyanazon projektmappájában lévő .md fájl is automatikusan frissül. Így minden AI asszisztens (Cursor, Warp, stb.) mindig naprakész, megosztott tudásbázissal rendelkezik.

**Utolsó frissítés:** 2025. november 1.  
**Verzió:** 2.0.0  
**Projekt:** Mobilien AI Agent (Mobi)

---

## 🏗️ Törzskönyvtár Struktúra

```
Agent/
├── backend/                    # Backend logika (Node.js + Express)
├── shared/                     # Megosztott erőforrások (prompts, knowledge, schemas)
├── frontend/                   # Frontend template-ek (WebApp előkészítés)
├── migrations/                 # PostgreSQL adatbázis migrációk
├── node_modules/               # npm függőségek (gitignore-ban)
├── context/                    # LEGACY - régi context fájlok (backward compatibility)
├── knowledge_base/             # LEGACY - régi knowledge base (backward compatibility)
├── .env                        # Environment változók (GITIGNORE!)
├── package.json                # npm projekt konfiguráció
├── package-lock.json           # npm dependency lock
├── README.md                   # Fő dokumentáció
├── REFACTORING.md              # Refactoring történet és döntések
├── MIGRATION_GUIDE.md          # Mistral → OpenRouter migráció útmutató
├── server.js                   # LEGACY - régi szerver (backward compatibility)
├── config.js                   # LEGACY - régi config (backward compatibility)
├── openrouter.js               # LEGACY - régi openrouter helper (backward compatibility)
└── MCP_*.md                    # MCP Context dokumentációk (ez a fájl is)
```

---

## 📦 Fő Fájlok és Szerepük

### 1. `package.json` (npm projekt konfiguráció)
**Verzió:** 2.0.0  
**Main entry point:** `backend/server.js`

**Scripts:**
- `npm start` → `node backend/server.js` (production)
- `npm run dev` → `nodemon backend/server.js` (development, auto-reload)
- `npm run start:legacy` → `node server.js` (régi verzió, backward compatibility)

**Függőségek:**
- `express` (^4.18.2) - Web framework
- `cors` (^2.8.5) - CORS middleware
- `dotenv` (^16.3.1) - Environment változók betöltése
- `pg` (^8.11.3) - PostgreSQL client
- `axios` (^1.6.2) - HTTP client (OpenRouter API hívásokhoz)

**Dev függőségek:**
- `nodemon` (^3.0.2) - Auto-reload development szerverhez

**Miért fontos:** Ez a fájl definiálja a projekt függőségeit és indítási parancsait. A v2.0.0-ban frissítettük, hogy a `backend/server.js`-t használja main entry point-ként.

---

### 2. `.env` (Environment változók)
**Helye:** `Agent/.env`  
**FONTOS:** Ez a fájl `.gitignore`-ban van, NEM commitoljuk!

**Tartalom:**
```env
OPENROUTER_API_KEY=sk-or-v1-...           # OpenRouter API kulcs
GPT_MODEL=openai/gpt-oss-20b:free         # Használt GPT model
DATABASE_URL=postgresql://...             # PostgreSQL connection string
PORT=3000                                 # Szerver port
```

**Miért fontos:** Érzékeny adatokat (API kulcsok, DB jelszavak) tartalmaz. A `backend/config.js` innen tölti be a konfigurációt.

---

### 3. `README.md` (Fő dokumentáció)
**Tartalom:**
- Projekt áttekintés
- Telepítési útmutató
- API endpoints dokumentáció
- Konfiguráció beállítások
- Docker deployment
- Jövőbeli fejlesztések roadmap

**Miért fontos:** Ez az első dokumentum, amit egy új fejlesztő elolvas. Tartalmazza az összes szükséges információt a projekt indításához.

---

### 4. `REFACTORING.md` (Refactoring történet)
**Tartalom:**
- v1.0.0 → v2.0.0 átállás részletei
- Új moduláris architektúra magyarázata
- Változtatások listája (backend/, shared/, frontend/)
- Backward compatibility információk
- Tesztelési eredmények

**Miért fontos:** Dokumentálja, hogy miért és hogyan változott a projekt struktúrája. Segít megérteni a design döntéseket.

---

### 5. `MIGRATION_GUIDE.md` (Mistral → OpenRouter migráció)
**Tartalom:**
- Mistral API → OpenRouter API átállás lépései
- Kód változtatások
- Environment változók módosítások
- Tesztelési útmutató

**Miért fontos:** Történelmi dokumentum, amely megmutatja, hogyan álltunk át a Mistral-ról az OpenRouter-re.

---

## 🔄 Legacy Fájlok (Backward Compatibility)

### Miért maradtak meg?
A v2.0.0 refactoring során az új fájlokat a `backend/`, `shared/`, `frontend/` mappákba helyeztük, de a régi fájlokat **megőriztük** a törzskönyvtárban, hogy:
1. **Docker container** továbbra is működjön (ha `node server.js`-t használ)
2. **Production deployment** ne omoljon össze
3. **Fokozatos átállás** lehetséges legyen

### Legacy fájlok listája:
- `server.js` - Régi Express szerver (használd helyette: `backend/server.js`)
- `config.js` - Régi konfiguráció (használd helyette: `backend/config.js`)
- `openrouter.js` - Régi OpenRouter helper (használd helyette: `backend/openrouter.js`)
- `context/` - Régi context fájlok (használd helyette: `shared/knowledge/`)
- `knowledge_base/` - Régi knowledge base (használd helyette: `shared/knowledge/`)

**Ajánlás:** Frissítsd a production deployment script-eket, hogy `node backend/server.js`-t használjanak!

---

## 🚀 Indítási Folyamat

### 1. Telepítés
```bash
cd Agent
npm install
```

### 2. Environment beállítása
Hozz létre `.env` fájlt:
```env
OPENROUTER_API_KEY=your-key-here
GPT_MODEL=openai/gpt-oss-20b:free
DATABASE_URL=postgresql://...
PORT=3000
```

### 3. Szerver indítása
```bash
# Development (auto-reload)
npm run dev

# Production
npm start

# Legacy (régi verzió)
npm run start:legacy
```

### 4. Tesztelés
```bash
curl http://localhost:3000/health
# Response: {"status":"ok","timestamp":"..."}
```

---

## 🔗 Kapcsolódó MCP Context Fájlok

- **[MCP_BACKEND_CONTEXT.md](MCP_BACKEND_CONTEXT.md)** - Backend logika (server, config, openrouter)
- **[MCP_SHARED_CONTEXT.md](MCP_SHARED_CONTEXT.md)** - Megosztott erőforrások (prompts, knowledge, schemas)
- **[MCP_FRONTEND_CONTEXT.md](MCP_FRONTEND_CONTEXT.md)** - Frontend template-ek (WebApp előkészítés)

---

## 📝 Változtatási Történet

### 2025. november 1. - v2.0.0 Refactoring
- ✅ Moduláris architektúra bevezetése
- ✅ Backend, shared, frontend mappák létrehozása
- ✅ System prompt kiszervezése külön fájlba
- ✅ Package.json frissítése (backend/server.js)
- ✅ Comprehensive dokumentáció (README, REFACTORING)
- ✅ Backward compatibility megőrzése

### Korábbi verziók
- v1.0.0 - Mistral → OpenRouter migráció
- v0.x - Eredeti Mistral alapú implementáció

---

## 🎯 Jövőbeli Fejlesztések

1. **MCP API Endpoint** - FastAPI + REST API a .md fájlok szinkronizációjához
2. **WebApp Integráció** - `frontend/webapp/` komponensek létrehozása
3. **Multi-platform Support** - Közös backend, platform-specifikus frontend-ek
4. **Session Management** - PostgreSQL-ben tárolt session-ök
5. **Function Calling** - AI tool use támogatás
6. **Real-time Data** - Töltőállomás adatok integráció

---

**Megjegyzés:** Ez a dokumentum automatikusan szinkronizálódik a team tagok között (jövőbeli MCP API implementáció után). Ha módosítod, a változtatások megjelennek minden fejlesztő lokális projektmappájában.

