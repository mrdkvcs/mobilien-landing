# Agent API Test

Ez a mappa az Agent API tesztelésére szolgál.

## Fájlok

- `test-api.js` - API kapcsolat tesztelése
- `README.md` - Ez a dokumentáció

## Használat

1. Győződj meg róla, hogy a `.env` fájlban van az `AGENT_API_KEY`
2. Futtasd a tesztet:
   ```bash
   node Agent/test-api.js
   ```

## API Kulcs

Az API kulcs a `.env` fájlból töltődik be:
```env
AGENT_API_KEY=your_api_key_here
```

## Megjegyzések

- A teszt script ellenőrzi, hogy az API kulcs elérhető-e
- Ha nincs API kulcs, hibaüzenetet ad
- A script egy példa API hívást próbál meg (cseréld le a valódi endpoint-ra)
