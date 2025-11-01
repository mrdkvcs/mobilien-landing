# Mobi AI Agent - Frontend Templates

Ez a mappa tartalmazza a Mobi AI Agent frontend komponenseit, amelyek használhatók Next.js vagy React projektekben.

## 📦 Komponensek

### 1. AIChatWidget.tsx
A fő chat widget komponens, amely kezeli:
- Üzenet küldést és fogadást
- Session management
- Markdown renderelést
- Chart megjelenítést
- Auto-scroll funkciót

### 2. AIChatPanel.tsx
A chat widget wrapper komponense animált háttérrel és gradientekkel.

### 3. ChartRenderer.tsx
Grafikon renderelő komponens, amely:
- JSON chart adatokat dolgoz fel
- Recharts library-t használ
- Bar chart típust támogat
- Testreszabható színekkel

## 🔧 Használat

### Telepítés

```bash
npm install react-markdown remark-gfm recharts lucide-react
npm install -D @tailwindcss/typography
```

### Tailwind konfiguráció

```javascript
// tailwind.config.ts
plugins: [
  require("@tailwindcss/typography"),
],
```

### Integráció

```typescript
// app/page.tsx vagy components/YourComponent.tsx
import AIChatPanel from '@/components/AIChatPanel';

export default function Page() {
  return (
    <div>
      <AIChatPanel />
    </div>
  );
}
```

### Environment változók

```env
# .env.local
NEXT_PUBLIC_API_URL=http://localhost:3000  # Agent backend URL
```

## 🌐 API Endpoint

A komponensek a következő endpointot használják:
- **POST** `/api/chat`
  - Request: `{ message: string, sessionId?: string }`
  - Response: `{ reply: string, sessionId: string }`

## 📝 Megjegyzések

- A komponensek Next.js 13+ App Router-rel kompatibilisek
- `"use client"` direktívát használnak
- TypeScript típusokkal ellátottak
- Tailwind CSS-t használnak a styling-hoz

## 🔄 Frissítések

Ha a backend system prompt-ot vagy knowledge base-t frissíted, a frontend komponensek automatikusan az új válaszokat fogják megjeleníteni, újraépítés nélkül.

## 🚀 WebApp integráció (jövőbeli)

Ezek a template-ek előkészítve vannak a Mobilien WebApp integrációjához. A WebApp saját UI testreszabásokat használhat, miközben ugyanazt a backend API-t használja.

