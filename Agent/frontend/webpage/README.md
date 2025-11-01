# 🌐 Mobi AI Agent - Webpage Components

Ez a mappa tartalmazza a **Mobilien AI Agent (Mobi)** weboldal komponenseit.

## 📦 Komponensek

### 1. `AIChatWidget.tsx`
Fő chat widget komponens a weboldalhoz:
- Üzenet küldés/fogadás
- Session management (localStorage)
- Markdown renderelés (react-markdown, remark-gfm)
- Chart megjelenítés (ChartRenderer)
- Auto-scroll funkció

### 2. `AIChatPanel.tsx`
Chat widget wrapper animált háttérrel:
- Gradient háttér animációk
- Flowing shapes
- Shimmer efektek
- Marketing-fokuszú design

### 3. `ChartRenderer.tsx`
Grafikon renderelő komponens:
- JSON chart adatok feldolgozása
- Recharts library (BarChart)
- Responsive design

## 🔗 Használat

### Importálás
```typescript
import AIChatPanel from "@/Agent/frontend/webpage/AIChatPanel";
import ChartRenderer from "@/Agent/frontend/webpage/ChartRenderer";
```

### Példa
```typescript
// app/page.tsx
import AIChatPanel from "@/Agent/frontend/webpage/AIChatPanel";

export default function Page() {
  return (
    <div>
      <AIChatPanel />
    </div>
  );
}
```

## 📝 Megjegyzések

- **Platform:** Mobilien.app weboldal (marketing, információ)
- **UI Stílus:** Animált háttér, gradientek, modern design
- **Cél:** Marketing és információ közvetítés
- További információ: [MCP_FRONTEND_CONTEXT.md](../MCP_FRONTEND_CONTEXT.md)

## 🆚 WebApp vs Webpage

- **Webpage (ez a mappa):** Marketing weboldal, beágyazott chat widget
- **WebApp (../webapp/):** Felhasználói dashboard, funkcionális UI (jövőbeli)

