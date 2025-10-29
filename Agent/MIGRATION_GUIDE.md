# Migráció Mistral-ról OpenRouter GPT-re

Ez a dokumentum segít áttérni a Mistral API-ról az OpenRouter GPT API-ra.

## 1. Környezeti változók beállítása

### Régi (Mistral):
```env
AGENT_API_KEY=your_mistral_api_key
```

### Új (OpenRouter):
```env
OPENROUTER_API_KEY=your_openrouter_api_key
GPT_MODEL=openai/gpt-4-turbo
```

**Figyelem:** A `config.js` továbbra is támogatja az `AGENT_API_KEY` környezeti változót az OpenRouter kulcs számára is, így nem kell frissíteni, ha már használod.

## 2. API Endpoint változások

### Mistral API:
- **Endpoint:** `https://api.mistral.ai/v1/chat/completions`
- **Model:** `mistral-small-latest`

### OpenRouter API:
- **Endpoint:** `https://openrouter.ai/api/v1/chat/completions`
- **Model:** `openai/gpt-4-turbo` (vagy más választott modell)

## 3. Kód módosítások

### Régi server.js fetch hívás:
```javascript
const mistralResponse = await fetch('https://api.mistral.ai/v1/chat/completions', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${AGENT_API_KEY}`,
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    model: 'mistral-small-latest',
    messages,
    max_tokens: 500,
    temperature: 0.7
  })
});
```

### Új server.js OpenRouter hívás (helper használatával):
```javascript
const openrouter = require('./openrouter');

const response = await openrouter.chatCompletion(messages, {
  max_tokens: 500,
  temperature: 0.7
});
const reply = openrouter.getReplyText(response);
```

## 4. Header eltérések

Az OpenRouter API igényel pár extra header-t:

```javascript
headers: {
  'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
  'Content-Type': 'application/json',
  'HTTP-Referer': 'https://mobilien.app',  // Kötelező
  'X-Title': 'Mobilien AI Agent',          // Opcionális, de ajánlott
}
```

## 5. Model nevek

| Mistral | OpenRouter ekvivalens |
|---------|----------------------|
| mistral-small-latest | openai/gpt-3.5-turbo |
| mistral-medium-latest | openai/gpt-4-turbo |
| mistral-large-latest | openai/gpt-4 |

**Ajánlott:** `openai/gpt-4-turbo` vagy `openai/gpt-4o` a legjobb minőségért.

## 6. Költségek

Az OpenRouter árazása modell-függő:
- GPT-3.5 Turbo: ~$0.5 / 1M token (bemenet)
- GPT-4 Turbo: ~$10 / 1M token (bemenet)
- GPT-4o: ~$2.5 / 1M token (bemenet)
- GPT-4o Mini: ~$0.15 / 1M token (bemenet)

Részletek: https://openrouter.ai/models

## 7. Response formátum

A response formátum ugyanaz marad (OpenAI-kompatibilis):

```json
{
  "id": "chatcmpl-...",
  "object": "chat.completion",
  "created": 1234567890,
  "model": "openai/gpt-4-turbo",
  "choices": [
    {
      "index": 0,
      "message": {
        "role": "assistant",
        "content": "Az asszisztens válasza..."
      },
      "finish_reason": "stop"
    }
  ],
  "usage": {
    "prompt_tokens": 10,
    "completion_tokens": 20,
    "total_tokens": 30
  }
}
```

## 8. Tesztelés

A migráció után:

1. **Teszteld az OpenRouter kapcsolatot:**
```bash
npm run test:openrouter
```

2. **Indítsd el a szervert:**
```bash
npm start
```

3. **Tesztelj egy chat üzenetet:**
```bash
curl -X POST http://localhost:3000/api/chat \
  -H "Content-Type: application/json" \
  -d '{"message": "Szia!"}'
```

## 9. Hibaelhárítás

### "Missing API key" hiba
- Ellenőrizd, hogy az `OPENROUTER_API_KEY` be van-e állítva
- Futtasd: `node -e "console.log(require('./config').openrouter.apiKey)"`

### 401 Unauthorized
- Az API kulcsod érvénytelen vagy lejárt
- Szerezz új kulcsot: https://openrouter.ai/keys

### 429 Rate Limited
- Túl sok kérést küldtél
- Várj egy kicsit, vagy növeld a rate limit-et az OpenRouter dashboardon

### Timeout
- Növeld a timeout értéket a konfigban vagy a hívásban
- Alapértelmezett: 30000ms (30 sec)

## 10. Előnyök az OpenRouter használatával

✅ Hozzáférés több AI modellhez egy API-n keresztül  
✅ GPT-4, Claude, Gemini, Llama és még sok más  
✅ Automatikus fallback más modellekre  
✅ Költségoptimalizálás  
✅ Rate limiting kezelés  
✅ Részletes usage statisztikák  

## További információk

- OpenRouter dokumentáció: https://openrouter.ai/docs
- API kulcsok: https://openrouter.ai/keys
- Modellek és árazás: https://openrouter.ai/models

