# 📚 MCP Context: Shared Resources

## 📋 Meta Információ
**Fájl célja:** Ez egy Model Context Protocol (MCP) dokumentációs fájl, amely a Mobilien AI Agent megosztott erőforrásainak (prompts, knowledge base, schemas) aktuális állapotát és struktúráját dokumentálja. AI asszisztensek számára biztosít központosított, szinkronizált tudásbázist.

**Szinkronizáció:** Jövőbeli cél, hogy ez a fájl API végponton keresztül (FastAPI + REST API vagy hasonló) hostolva legyen, így ha egy fejlesztő frissíti, akkor a másik fejlesztő ugyanazon projektmappájában lévő .md fájl is automatikusan frissül. Így minden AI asszisztens mindig naprakész, megosztott tudásbázissal rendelkezik.

**Utolsó frissítés:** 2025. november 1.  
**Verzió:** 2.0.0  
**Projekt:** Mobilien AI Agent - Shared Resources

---

## 🏗️ Shared Struktúra

```
Agent/shared/
├── prompts/                    # AI system prompt-ok
│   └── mobi-system-prompt.txt
├── knowledge/                  # Tudásbázis (context, questions)
│   ├── context-graph.json
│   └── main-questions.md
└── schemas/                    # JSON sémák (validáció)
    └── chart-schema.json
```

---

## 📁 1. Prompts Mappa (`prompts/`)

### `mobi-system-prompt.txt` - Mobi AI System Prompt

**Felelősség:** Mobi személyiségének, viselkedésének és válasz formázási szabályainak definiálása.

**Teljes tartalom:**
```
Te vagy Mobi, az e-mobilitási asszisztens. Segítesz az elektromos járművek töltésével, árazással és e-mobilitási kérdésekkel kapcsolatban.

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
{{GRAPH_CONTEXT}}

Ha "context-graph" vagy "töltési árak" kérés jön, másold be PONTOSAN ezt a JSON-t a chart blokkba (három backtick)chart és (három backtick) közé!
```

**Fontos elemek:**

1. **Személyiség:** Mobi, az e-mobilitási asszisztens
2. **Kontextus használat:** Elsődlegesen a mellékelt kontextust használja, másodlagosan saját tudását
3. **Válasz hossz:** Tömör (1-2 mondat) vagy részletes (komplex kérdéseknél)
4. **Formázás:** Markdown (félkövér, táblázatok, listák, címsorok)
5. **Grafikon generálás:** 
   - Trigger szavak: "mutasd grafikonon", "ábrázolja", "context-graph", "EV töltési árak"
   - Formátum: ` ```chart\n{JSON}\n``` `
   - Schema: `name` + `yAxis` field (pl. `price`, `value`)

**Template Placeholder:**
- `{{GRAPH_CONTEXT}}` - A `backend/server.js` ezt helyettesíti a `context-graph.json` tartalmával

**Használat a backend-ben:**
```javascript
// backend/server.js
let systemPrompt = systemPromptTemplate.replace(
  '{{GRAPH_CONTEXT}}',
  JSON.stringify(graphContext, null, 2)
);
```

**Módosítás:** Ha a prompt-ot módosítod, mentsd el a fájlt és indítsd újra a szervert (`npm start`). A változtatások azonnal érvénybe lépnek.

---

## 📁 2. Knowledge Mappa (`knowledge/`)

### `context-graph.json` - EV Töltési Árak Grafikon Adat

**Felelősség:** Előre definiált grafikon adatok tárolása, amelyeket az AI visszaadhat, ha a felhasználó grafikont kér.

**Teljes tartalom:**
```json
{
  "graphId": "ev-charging-prices-comparison",
  "title": "EV Töltési Árak Összehasonlítása (2025)",
  "description": "Különböző töltőszolgáltatók átlagos kWh árai Magyarországon",
  "type": "bar",
  "data": [
    { "name": "Mobiliti", "price": 0, "currency": "Ft/kWh" },
    { "name": "MOL Plugee", "price": 95, "currency": "Ft/kWh" },
    { "name": "E.ON Drive", "price": 115, "currency": "Ft/kWh" },
    { "name": "Ionity", "price": 149, "currency": "Ft/kWh" },
    { "name": "Tesla Supercharger", "price": 125, "currency": "Ft/kWh" },
    { "name": "NKM", "price": 89, "currency": "Ft/kWh" }
  ],
  "xAxis": "name",
  "yAxis": "price",
  "yAxisLabel": "Ár (Ft/kWh)",
  "color": "#009fa9"
}
```

**Séma magyarázat:**
- `graphId`: Egyedi azonosító
- `title`: Grafikon címe
- `description`: Grafikon leírása
- `type`: Grafikon típus (`bar`, `line`, `pie`)
- `data`: Adatpontok tömbje
  - Minden objektumnak kell lennie `name` mezőnek (X tengely)
  - És a `yAxis` mezőben megadott mezőnek (Y tengely, pl. `price`)
- `xAxis`: X tengely mező neve (általában `name`)
- `yAxis`: Y tengely mező neve (pl. `price`, `value`, `count`)
- `yAxisLabel`: Y tengely címkéje
- `color`: Grafikon színe (hex formátum, default: `#009fa9`)

**Használat:**
1. **Backend:** Betöltődik a `backend/server.js`-ben startup-kor
2. **System Prompt:** Beillesztődik a `{{GRAPH_CONTEXT}}` placeholder helyére
3. **AI Válasz:** Ha a felhasználó "context-graph"-ot vagy "EV töltési árak"-at kér, az AI ezt a JSON-t adja vissza ` ```chart ` blokkban
4. **Frontend:** A `ChartRenderer.tsx` komponens rendereli a grafikont

**Módosítás:** Ha új adatokat adsz hozzá vagy módosítod az árakat:
1. Szerkeszd a `context-graph.json` fájlt
2. Indítsd újra a backend szervert (`npm start`)
3. Az AI az új adatokat fogja használni

---

### `main-questions.md` - Top 10 Magyar EV Felhasználói Kérdés

**Felelősség:** Gyakori kérdések dokumentálása, amelyeket magyar EV felhasználók feltesznek. Segít megérteni a felhasználói igényeket és a jövőbeli feature-ök tervezését.

**Tartalom (összefoglaló):**

1. **🔌 Hol tudok tölteni most a közelben?**
   - Legközelebbi ingyenes/elérhető töltő
   - Leggyorsabb DC töltő
   - Szolgáltató-specifikus (pl. MOL Plugee)
   - **Adatigény:** Valós idejű töltőállapot, GPS

2. **⚡ Mennyibe kerül a töltés?**
   - Szolgáltatói tarifák
   - Díjzónák
   - Otthoni vs. közterületi töltés
   - **Adatigény:** Szolgáltatói tarifák, időalapú/kWh-alapú árak

3. **🚗 Mennyi időbe telik feltölteni az autómat?**
   - Járműspecifikus töltési idők
   - Töltési görbék (20% → 80%)
   - **Adatigény:** Járműspecifikus töltési görbék, teljesítményadatok

4. **🗺️ Útvonaltervezés töltőkkel**
   - Hosszú távú útvonalak (pl. Budapest → Split)
   - Megállás nélküli távolság
   - **Adatigény:** Route + töltő elhelyezkedés, fogyasztási modellek

5. **🔋 Otthoni töltés és eszközök**
   - Fali töltő ajánlások
   - Elektromos követelmények (amper, kW)
   - Engedélyek (társasház)
   - **Adatigény:** MVM, E.ON, szabályozások

6. **📊 Töltési statisztikák és költségek**
   - Havi töltési költségek
   - kWh fogyasztás
   - 100 km költség
   - **Adatigény:** Felhasználói naplózás, dashboard

7. **🧠 Autó-specifikus információk**
   - Autó vásárlási tanácsok
   - Töltési teljesítmény
   - Hatótáv összehasonlítások
   - **Adatigény:** EV adatbázis (EV-database.eu)

8. **🌱 Zöldenergia és környezetvédelem**
   - CO₂ csökkentés
   - Napelemes töltők
   - Saját napelem rendszer
   - **Adatigény:** Energiamix, CO₂ kalkulációk

9. **🧾 Állami támogatások és szabályozások**
   - Vásárlási támogatások
   - Céges kedvezmények
   - Zöld programok
   - **Adatigény:** Kormányzati oldalak, EMIT, NKFIH

10. **🧭 Felhasználói tapasztalatok és hibák**
    - Töltő működési problémák
    - Közösségi feedback
    - Töltő megbízhatóság
    - **Adatigény:** Közösségi adatgyűjtés, user feedback

**Használat:**
- **Dokumentáció:** Segít megérteni a felhasználói igényeket
- **Feature Planning:** Jövőbeli fejlesztések priorizálása
- **AI Training:** Mobi tudásbázisának bővítése (jövőbeli)

**Módosítás:** Ha új kérdéskategóriákat azonosítasz, add hozzá a listához.

---

## 📁 3. Schemas Mappa (`schemas/`)

### `chart-schema.json` - Chart Adatstruktúra JSON Schema

**Felelősség:** Definiálja a chart adatok JSON sémáját, amely validálásra és dokumentációra használható.

**Teljes tartalom:**
```json
{
  "$schema": "http://json-schema.org/draft-07/schema#",
  "title": "Mobi Chart Data Schema",
  "description": "Schema for chart data used by ChartRenderer component",
  "type": "object",
  "required": ["type", "data", "xAxis", "yAxis"],
  "properties": {
    "graphId": {
      "type": "string",
      "description": "Unique identifier for the chart"
    },
    "title": {
      "type": "string",
      "description": "Chart title"
    },
    "description": {
      "type": "string",
      "description": "Chart description"
    },
    "type": {
      "type": "string",
      "enum": ["bar", "line", "pie"],
      "description": "Chart type"
    },
    "data": {
      "type": "array",
      "description": "Array of data points",
      "items": {
        "type": "object",
        "description": "Each data point must have 'name' and the field specified in yAxis"
      }
    },
    "xAxis": {
      "type": "string",
      "description": "Field name for X axis (usually 'name')"
    },
    "yAxis": {
      "type": "string",
      "description": "Field name for Y axis (e.g., 'value', 'price', 'count')"
    },
    "yAxisLabel": {
      "type": "string",
      "description": "Label for Y axis"
    },
    "color": {
      "type": "string",
      "description": "Bar/line color in hex format (default: #009fa9)"
    }
  }
}
```

**Kötelező mezők:**
- `type`: Grafikon típus (`bar`, `line`, `pie`)
- `data`: Adatpontok tömbje
- `xAxis`: X tengely mező neve
- `yAxis`: Y tengely mező neve

**Opcionális mezők:**
- `graphId`: Egyedi azonosító
- `title`: Grafikon címe
- `description`: Grafikon leírása
- `yAxisLabel`: Y tengely címkéje
- `color`: Grafikon színe (hex, default: `#009fa9`)

**Használat:**
1. **Dokumentáció:** Meghatározza a chart adatok struktúráját
2. **Validáció:** (Jövőbeli) JSON schema validátor használható
3. **AI Guidance:** Az AI ezt a sémát követi, amikor grafikont generál

**Példa valid chart adat:**
```json
{
  "type": "bar",
  "data": [
    { "name": "Kategória 1", "value": 100 },
    { "name": "Kategória 2", "value": 200 }
  ],
  "xAxis": "name",
  "yAxis": "value",
  "yAxisLabel": "Érték",
  "color": "#009fa9"
}
```

---

## 🔄 Shared Resources Használati Folyamat

### 1. Backend Startup
```
1. backend/server.js elindul
2. Betölti: shared/prompts/mobi-system-prompt.txt
3. Betölti: shared/knowledge/context-graph.json
4. System prompt template: {{GRAPH_CONTEXT}} → context-graph.json
5. System prompt készen áll a chat endpoint-hoz
```

### 2. Chat Request
```
1. User: "Mutasd grafikonon az EV töltési árakat"
2. Backend: System prompt + user message → OpenRouter API
3. AI: Felismeri a "grafikonon" trigger szót
4. AI: Visszaadja a context-graph.json-t ```chart blokkban
5. Frontend: ChartRenderer.tsx rendereli a grafikont
```

### 3. Prompt Módosítás
```
1. Szerkeszd: shared/prompts/mobi-system-prompt.txt
2. Mentsd el
3. Indítsd újra a backend szervert: npm start
4. Új prompt azonnal érvényben
```

### 4. Knowledge Bővítés
```
1. Adj hozzá új JSON fájlt: shared/knowledge/new-data.json
2. Frissítsd: backend/server.js (betöltés logika)
3. Frissítsd: shared/prompts/mobi-system-prompt.txt (új placeholder)
4. Indítsd újra a szervert
```

---

## 🎯 Jövőbeli Fejlesztések

### 1. Több Grafikon Adat
- `context-graph-chargers.json` - Töltőállomások száma városonként
- `context-graph-vehicles.json` - EV modellek összehasonlítása
- `context-graph-consumption.json` - Fogyasztási adatok

### 2. Dinamikus Knowledge Base
- PostgreSQL-ben tárolt knowledge
- API endpoint a knowledge frissítésére
- Valós idejű szinkronizáció

### 3. Multi-language Prompts
- `mobi-system-prompt-en.txt` - Angol verzió
- `mobi-system-prompt-de.txt` - Német verzió
- Language detection a backend-ben

### 4. Schema Validáció
- JSON Schema validator implementáció
- AI válasz validálása (chart JSON)
- Error handling invalid chart adatoknál

---

## 🔗 Kapcsolódó Fájlok

- **[../backend/server.js](../backend/server.js)** - Betölti ezeket a resource-okat
- **[../backend/MCP_BACKEND_CONTEXT.md](../backend/MCP_BACKEND_CONTEXT.md)** - Backend dokumentáció
- **[../../components/ChartRenderer.tsx](../../components/ChartRenderer.tsx)** - Frontend chart renderer

---

## 📝 Változtatási Történet

### 2025. november 1. - v2.0.0
- ✅ Shared mappa létrehozása
- ✅ System prompt kiszervezése külön fájlba
- ✅ Context-graph.json létrehozása
- ✅ Main-questions.md dokumentálása
- ✅ Chart-schema.json létrehozása
- ✅ Template placeholder rendszer ({{GRAPH_CONTEXT}})

---

**Megjegyzés:** Ez a dokumentum automatikusan szinkronizálódik a team tagok között (jövőbeli MCP API implementáció után). Ha módosítod a shared resource-okat, dokumentáld itt a változtatásokat!

