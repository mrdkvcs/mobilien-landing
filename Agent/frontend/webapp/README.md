# 📱 Mobi AI Agent - WebApp Components

Ez a mappa tartalmazza a **Mobilien AI Agent (Mobi)** WebApp komponenseit.

## 📋 Jelenlegi Állapot

**Ez a mappa jelenleg üres.** A WebApp komponensek jövőben kerülnek ide.

## 🎯 Tervezett Komponensek

### 1. `AIChatWidget.tsx` (jövőbeli)
WebApp-specifikus chat widget:
- Teljes képernyős chat interface
- Dashboard-integráció
- Felhasználói statisztikák

### 2. `AIChatPanel.tsx` (jövőbeli)
WebApp chat wrapper:
- Funkcionális, dashboard-szerű design
- Nincs animált háttér (webpage-től eltérően)

### 3. `ChatHistory.tsx` (jövőbeli)
Korábbi beszélgetések kezelése:
- Session history
- Beszélgetés keresés
- Export funkciók

### 4. `UserStats.tsx` (jövőbeli)
Töltési statisztikák:
- Havi költségek
- kWh fogyasztás
- 100 km költség

### 5. `RoutePlanner.tsx` (jövőbeli)
Útvonaltervezés EV-kkel:
- Töltőállomás keresés
- Route optimization
- Töltési idő becslés

## 🔗 Használat (Jövőbeli)

### Importálás
```typescript
import AIChatWidget from "@/Agent/frontend/webapp/AIChatWidget";
```

## 📝 Megjegyzések

- **Platform:** Mobilien WebApp (felhasználói dashboard)
- **UI Stílus:** Funkcionális, dashboard-szerű
- **Cél:** Felhasználói funkciók, statisztikák, útvonaltervezés
- **Backend:** Ugyanaz a közös backend API (`Agent/backend/server.js`)
- További információ: [MCP_FRONTEND_CONTEXT.md](../MCP_FRONTEND_CONTEXT.md)

## 🆚 WebApp vs Webpage

- **Webpage (../webpage/):** Marketing weboldal, animált design
- **WebApp (ez a mappa):** Felhasználói dashboard, funkcionális UI

