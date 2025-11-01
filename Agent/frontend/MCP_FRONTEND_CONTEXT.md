# 🎨 MCP Context: Frontend Templates

## 📋 Meta Információ
**Fájl célja:** Ez egy Model Context Protocol (MCP) dokumentációs fájl, amely a Mobilien AI Agent frontend template-jeinek aktuális állapotát és jövőbeli WebApp integrációs terveit dokumentálja. AI asszisztensek számára biztosít központosított, szinkronizált tudásbázist.

**Szinkronizáció:** Jövőbeli cél, hogy ez a fájl API végponton keresztül (FastAPI + REST API vagy hasonló) hostolva legyen, így ha egy fejlesztő frissíti, akkor a másik fejlesztő ugyanazon projektmappájában lévő .md fájl is automatikusan frissül. Így minden AI asszisztens mindig naprakész, megosztott tudásbázissal rendelkezik.

**Utolsó frissítés:** 2025. november 1.  
**Verzió:** 2.0.1  
**Projekt:** Mobilien AI Agent - Frontend Templates

---

## 🏗️ Frontend Struktúra

```
Agent/frontend/
├── webpage/                # Weboldal komponensek (aktuális, működő)
│   ├── AIChatWidget.tsx
│   ├── AIChatPanel.tsx
│   ├── ChartRenderer.tsx
│   └── README.md
├── webapp/                  # WebApp komponensek (jövőbeli, üres)
│   └── README.md
├── templates/               # Általános template dokumentáció
│   └── README.md
└── MCP_FRONTEND_CONTEXT.md  # Ez a fájl
```

**Jelenlegi állapot:** ✅ Komponensek áthelyezve az `Agent/frontend/webpage/` mappába. WebApp mappa előkészítve.

---

## 📄 `templates/README.md` - Frontend Használati Útmutató

**Felelősség:** Dokumentálja a Mobi AI Agent frontend komponenseit, használatukat és integrációs lépéseket.

### Tartalom Összefoglalás

#### 1. Komponensek
- **AIChatWidget.tsx** - Fő chat widget komponens
- **AIChatPanel.tsx** - Chat wrapper animált háttérrel
- **ChartRenderer.tsx** - Grafikon renderelő komponens

#### 2. Telepítési Útmutató
```bash
npm install react-markdown remark-gfm recharts lucide-react
npm install -D @tailwindcss/typography
```

#### 3. Tailwind Konfiguráció
```javascript
plugins: [require("@tailwindcss/typography")]
```

#### 4. Environment Változók
```env
NEXT_PUBLIC_API_URL=http://localhost:3000
```

#### 5. API Endpoint Specifikáció
- **POST** `/api/chat`
  - Request: `{ message: string, sessionId?: string }`
  - Response: `{ reply: string, sessionId: string }`

---

## 🎯 Frontend Struktúra (Aktuális - v2.0.1)

### Multi-Platform Support (Implementálva)

```
Agent/frontend/
├── webpage/                        # ✅ Weboldal komponensek (aktuális, működő)
│   ├── AIChatWidget.tsx            # Chat widget
│   ├── AIChatPanel.tsx             # Animált wrapper
│   ├── ChartRenderer.tsx           # Grafikon renderelő
│   └── README.md                   # Dokumentáció
├── webapp/                         # ✅ WebApp komponensek (jövőbeli, üres)
│   └── README.md                   # WebApp tervek
├── templates/                      # Általános dokumentáció
│   └── README.md
└── MCP_FRONTEND_CONTEXT.md         # Ez a fájl
```

### Különbségek Website vs. WebApp

#### Website (mobilien.app)
- **Cél:** Marketing, információ, newsletter
- **UI:** Animált háttér, gradientek, modern design
- **Chat:** Beágyazott widget a landing page-en
- **Stílus:** Tailwind CSS, prose plugin

#### WebApp (jövőbeli)
- **Cél:** Felhasználói dashboard, töltési statisztikák, útvonaltervezés
- **UI:** Funkcionális, dashboard-szerű
- **Chat:** Teljes képernyős chat interface
- **Stílus:** Tailwind CSS, custom dashboard komponensek

---

## 📦 Frontend Komponensek (Agent/frontend/webpage/)

### 1. `AIChatWidget.tsx` - Fő Chat Widget

**Helye:** `Agent/frontend/webpage/AIChatWidget.tsx` ✅

**Felelősség:** Chat UI logika, üzenet küldés/fogadás, session management, Markdown renderelés.

**Főbb Funkciók:**

#### State Management
```typescript
const [messages, setMessages] = useState<Message[]>([]);
const [inputValue, setInputValue] = useState("");
const [isLoading, setIsLoading] = useState(false);
const [sessionId, setSessionId] = useState<string | null>(null);
```

**Mit csinál:**
- `messages`: Chat üzenetek tömbje (user + assistant)
- `inputValue`: Input mező aktuális értéke
- `isLoading`: Töltési állapot (API hívás közben)
- `sessionId`: Session azonosító (localStorage-ban tárolva)

#### Session Management
```typescript
useEffect(() => {
  const storedSessionId = localStorage.getItem('chat-session-id');
  if (storedSessionId) {
    setSessionId(storedSessionId);
  }
}, []);
```

**Mit csinál:** 
- Betölti a session ID-t localStorage-ból
- Ha nincs, új session-t hoz létre az első üzenet küldésekor
- Session ID-t visszaküldi minden request-ben

#### API Hívás
```typescript
const sendMessage = async () => {
  // API URL felismerés (localhost vs. production)
  let API_URL = process.env.NEXT_PUBLIC_API_URL || 
    (window.location.hostname === 'localhost' 
      ? 'http://localhost:3000' 
      : 'https://api.mobilien.app');
  
  const response = await fetch(`${API_URL}/api/chat`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ message, sessionId }),
  });
  
  const data = await response.json();
  // Session ID tárolása
  if (data.sessionId && !sessionId) {
    setSessionId(data.sessionId);
    localStorage.setItem('chat-session-id', data.sessionId);
  }
};
```

**Mit csinál:**
1. API URL automatikus felismerés (localhost / production)
2. POST request `/api/chat` endpoint-ra
3. Session ID kezelés (localStorage)
4. Error handling

#### Markdown Renderelés
```typescript
<ReactMarkdown 
  remarkPlugins={[remarkGfm]}
  components={{
    code({node, inline, className, children, ...props}) {
      const match = /language-(\w+)/.exec(className || '');
      const language = match ? match[1] : '';
      
      // Chart renderelés
      if (language === 'chart' && !inline) {
        return <ChartRenderer chartData={String(children).trim()} />;
      }
      
      // Normál code block
      return inline ? <code {...props}>{children}</code> : <pre>...</pre>;
    }
  }}
>
  {message.content}
</ReactMarkdown>
```

**Mit csinál:**
- Markdown → HTML konverzió
- GFM (GitHub Flavored Markdown) támogatás (táblázatok, stb.)
- Custom code component: ` ```chart ` blokkok → `ChartRenderer`
- Prose styling (Tailwind Typography plugin)

**Függőségek:**
- `react-markdown` - Markdown renderelés
- `remark-gfm` - GitHub Flavored Markdown
- `lucide-react` - Ikonok (Send, Bot, User)
- `ChartRenderer` - Grafikon komponens

---

### 2. `AIChatPanel.tsx` - Chat Wrapper

**Helye:** `Agent/frontend/webpage/AIChatPanel.tsx` ✅

**Felelősség:** Chat widget konténer animált háttérrel és gradientekkel.

**Főbb Elemek:**

#### Animált Háttér
```typescript
<div className="absolute inset-0 animate-[pulse_8s_ease-in-out_infinite_alternate]"
  style={{
    background: "radial-gradient(circle at 30% 20%, rgba(5,20,37,1) 100%, ...)"
  }}
/>
```

**Mit csinál:** Pulsing animáció 8 másodperc alatt, radial gradient háttér.

#### Flowing Shapes
```typescript
<div className="absolute -top-48 -left-48 w-[800px] h-[800px] animate-[flow_12s_ease-in-out_infinite]"
  style={{
    borderRadius: "40% 60% 50% 30%",
    background: "linear-gradient(45deg, rgba(35,175,205,0.15), ...)"
  }}
/>
```

**Mit csinál:** Nagy animált shape-ek, amelyek forognak és mozognak (12-15 sec).

#### Keyframe Animációk
```css
@keyframes pulse { 
  from { opacity: .5; transform: scale(1); } 
  to { opacity: .8; transform: scale(1.1); } 
}

@keyframes flow {
  0% { transform: rotate(0deg) translateX(0px) translateY(0px); }
  33% { transform: rotate(120deg) translateX(50px) translateY(-30px); }
  66% { transform: rotate(240deg) translateX(-20px) translateY(40px); }
  100% { transform: rotate(360deg) translateX(0px) translateY(0px); }
}
```

**Mit csinál:** Custom animációk a háttér elemekhez.

**Függőségek:**
- `AIChatWidget` - Beágyazott chat widget
- Tailwind CSS - Styling és animációk

---

### 3. `ChartRenderer.tsx` - Grafikon Renderelő

**Helye:** `Agent/frontend/webpage/ChartRenderer.tsx` ✅

**Felelősség:** JSON chart adatok → Recharts BarChart renderelés.

**Főbb Funkciók:**

#### JSON Parsing
```typescript
let data: ChartData;
if (typeof chartData === 'string') {
  data = JSON.parse(chartData);
} else {
  data = chartData;
}
```

**Mit csinál:** String vagy object input kezelése.

#### Data Validáció
```typescript
if (!chartDataArray || chartDataArray.length === 0) {
  return <div>Sajnos jelenleg nem áll rendelkezésre grafikonadat...</div>;
}
```

**Mit csinál:** Ellenőrzi, hogy van-e adat a grafikonhoz.

#### Recharts BarChart
```typescript
<ResponsiveContainer width="100%" height={160}>
  <BarChart data={chartDataArray} margin={{ top: 6, right: 6, left: 6, bottom: 6 }}>
    <XAxis dataKey={xAxis} tick={{ fontSize: 8, fill: '#d2d7dd' }} />
    <YAxis tick={{ fontSize: 8, fill: '#d2d7dd' }} label={yAxisLabel ? {...} : undefined} />
    <Tooltip contentStyle={{ backgroundColor: 'rgba(22,53,53,0.95)', ... }} />
    <Bar dataKey={yAxis} fill={barColor} radius={[4, 4, 0, 0]} />
  </BarChart>
</ResponsiveContainer>
```

**Mit csinál:**
- Responsive container (100% szélesség, 160px magasság)
- X tengely: `xAxis` mező (pl. `name`)
- Y tengely: `yAxis` mező (pl. `price`, `value`)
- Tooltip: Dark theme
- Bar: Kerekített sarkok, custom szín (default: `#009fa9`)

**Függőségek:**
- `recharts` - Chart library
  - `BarChart`, `Bar`, `XAxis`, `YAxis`, `Tooltip`, `ResponsiveContainer`

**Támogatott Chart Típusok:**
- ✅ `bar` - Bar chart (implementálva)
- ⏳ `line` - Line chart (jövőbeli)
- ⏳ `pie` - Pie chart (jövőbeli)

---

## 🔄 Frontend-Backend Kommunikáció

### 1. Chat Flow
```
1. User: Üzenet beírása → AIChatWidget
2. Frontend: POST /api/chat { message, sessionId }
3. Backend: Agent/backend/server.js
4. OpenRouter API: GPT model válasz
5. Backend: Response { reply, sessionId }
6. Frontend: Markdown renderelés (ReactMarkdown)
7. Ha ```chart blokk → ChartRenderer
8. Recharts: Grafikon megjelenítés
```

### 2. Chart Rendering Flow
```
1. User: "Mutasd grafikonon az EV töltési árakat"
2. Backend: AI felismeri a trigger szót
3. AI: Visszaadja context-graph.json-t ```chart blokkban
4. Frontend: ReactMarkdown code component
5. Language === 'chart' → ChartRenderer
6. ChartRenderer: JSON parsing
7. Recharts: BarChart renderelés
```

---

## 🎨 Styling és Design

### Tailwind CSS
- **Prose Plugin:** `@tailwindcss/typography` - Markdown styling
- **Custom Classes:** Chat buborékok, animációk
- **Responsive:** Mobile-first design

### Színpaletta
- **Primary:** `#009fa9` (Mobiliti brand color)
- **Background:** Dark gradients (`rgba(4,12,25,1)`, `rgba(4,73,111,1)`)
- **Text:** Light gray (`#d2d7dd`)
- **Accent:** Blue gradients (`#0066FF`, `#00C2FF`)

### Animációk
- **Pulse:** 8s ease-in-out infinite alternate
- **Flow:** 12-15s ease-in-out infinite
- **Float:** 4-6s ease-in-out infinite
- **Shimmer:** 3s ease-in-out infinite

---

## 🚀 WebApp Integráció (Jövőbeli)

### Jelenlegi Állapot

✅ **Webpage komponensek:** Áthelyezve és működő (`Agent/frontend/webpage/`)  
⏳ **WebApp komponensek:** Mappa előkészítve, komponensek jövőben kerülnek ide

### Tervezett WebApp Komponensek

1. **WebApp Komponensek Létrehozása** (jövőbeli)
   ```
   Agent/frontend/webapp/
   ├── AIChatWidget.tsx        # WebApp-specifikus UI
   ├── AIChatPanel.tsx         # Dashboard-szerű layout
   ├── ChatHistory.tsx         # Korábbi beszélgetések
   ├── UserStats.tsx           # Töltési statisztikák
   └── RoutePlanner.tsx        # Útvonaltervezés
   ```

2. **Közös Backend API**
   - ✅ Mindkét platform ugyanazt a `Agent/backend/server.js`-t használja
   - ⏳ Session management: PostgreSQL-ben tárolva (jövőbeli)
   - ⏳ User-specific context: Felhasználói adatok alapján (jövőbeli)

3. **Platform-Specifikus Styling**
   - ✅ Website: Animált, marketing-fokuszú (webpage mappában)
   - ⏳ WebApp: Funkcionális, dashboard-szerű (jövőbeli)

---

## 🗑️ Törölt Fájlok (NEM Mobi-hoz tartoznak)

### 1. `app/chat/page.tsx` (Törölve)
**Miért törölve:** Dedikált teljes képernyős chat oldal - nem kell, csak a beágyazott widget van használatban.

### 2. `app/api/chat/route.ts` (Törölve)
**Miért törölve:** Next.js API route fallback - nem kell, mert van külön Agent backend Docker-ben.

**Jelenlegi backend:** `Agent/backend/server.js` - ez a működő backend API.

---

## 🔗 Kapcsolódó Fájlok

- **[webpage/AIChatWidget.tsx](webpage/AIChatWidget.tsx)** - ✅ Chat widget (webpage)
- **[webpage/AIChatPanel.tsx](webpage/AIChatPanel.tsx)** - ✅ Chat panel (webpage)
- **[webpage/ChartRenderer.tsx](webpage/ChartRenderer.tsx)** - ✅ Chart renderer (webpage)
- **[../backend/server.js](../backend/server.js)** - ✅ Backend API
- **[../shared/MCP_SHARED_CONTEXT.md](../shared/MCP_SHARED_CONTEXT.md)** - Shared resources
- **[webapp/README.md](webapp/README.md)** - WebApp tervek (jövőbeli)

---

## 📝 Változtatási Történet

### 2025. november 1. - v2.0.1 (Legutóbbi)
- ✅ Komponensek áthelyezve: `components/` → `Agent/frontend/webpage/`
- ✅ Webpage és webapp mappák létrehozása
- ✅ `app/chat/page.tsx` törölve (nem kell)
- ✅ `app/api/chat/route.ts` törölve (nem kell, van külön backend)
- ✅ Import útvonalak frissítve: `@/Agent/frontend/webpage/...`
- ✅ README.md fájlok létrehozva webpage és webapp mappákhoz

### 2025. november 1. - v2.0.0
- ✅ Frontend mappa létrehozása
- ✅ Templates README.md dokumentálása
- ✅ WebApp integráció tervezése
- ✅ MCP_FRONTEND_CONTEXT.md létrehozása

---

**Megjegyzés:** Ez a dokumentum automatikusan szinkronizálódik a team tagok között (jövőbeli MCP API implementáció után). Ha módosítod a frontend komponenseket, dokumentáld itt a változtatásokat!

