# Mobilien AI Agent - OpenRouter GPT API

Ez a mappa a Mobilien AI Agent szerverét tartalmazza, amely OpenRouter GPT API-t használ.

## Fájlok

- `server.js` - Express szerver OpenRouter GPT API integrációval
- `config.js` - Konfigurációs beállítások
- `package.json` - Node.js függőségek
- `test-api.js` - API kapcsolat tesztelése
- `.env.example` - Példa környezeti változók fájl
- `README.md` - Ez a dokumentáció

## Telepítés

1. Telepítsd a függőségeket:
```bash
cd Agent
npm install
```

2. Hozz létre egy `.env` fájlt a gyökérkönyvtárban (vagy használd a `key.env`-t):
```env
OPENROUTER_API_KEY=your_openrouter_api_key_here
DATABASE_URL=postgresql://username:password@localhost:5432/mobilien
PORT=3000
GPT_MODEL=openai/gpt-4-turbo
```

## OpenRouter API Kulcs beszerzése

1. Regisztrálj az [OpenRouter](https://openrouter.ai/) oldalán
2. Lépj be és menj a [Keys](https://openrouter.ai/keys) oldalra
3. Hozz létre egy új API kulcsot
4. Másold be a `.env` fájlba

## Elérhető GPT modellek

Az OpenRouter-en keresztül elérhető GPT modellek:
- `openai/gpt-4-turbo` - GPT-4 Turbo (ajánlott)
- `openai/gpt-4` - GPT-4
- `openai/gpt-4o` - GPT-4 Optimized
- `openai/gpt-4o-mini` - GPT-4 Optimized Mini
- `openai/gpt-3.5-turbo` - GPT-3.5 Turbo (olcsóbb)

## Használat

### Szerver indítása

```bash
# Fejlesztői mód (auto-reload)
npm run dev

# Normál indítás
npm start
```

### API Endpoint

A szerver elindul a `http://localhost:3000` címen (vagy a megadott PORT-on).

**POST** `/api/chat`
```json
{
  "message": "Mennyibe kerül az elektromos autó töltése?"
}
```

Válasz:
```json
{
  "reply": "Az AI válasza..."
}
```

## Tesztelés

```bash
node test-api.js
```

## Konfiguráció

A `config.js` fájlban módosíthatod:
- API kulcsot
- GPT modellt
- Hőmérsékletet (temperature)
- Max tokeneket
- CORS beállításokat
- Adatbázis kapcsolatot

## Megjegyzések

- Az API kulcs biztonságos tárolása érdekében használd a `.env` fájlt
- A `.env` fájl nincs verziókövetés alatt (.gitignore)
- A szerver automatikusan betölti a kontextus adatokat a PostgreSQL-ből
- CORS beállítások production domainekre vannak konfigurálva
