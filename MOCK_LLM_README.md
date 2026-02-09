# Mock LLM Server - Guida

## 📝 Descrizione

Questo è un server mock che simula un endpoint LLM compatibile con OpenAI API. Risponde sempre con una risposta standard predefinita, utile per test e sviluppo.

## 🚀 Come avviare

### Metodo 1: Script di avvio (Windows)
```bash
start-mock-llm.bat
```

### Metodo 2: Script di avvio (Linux/Mac)
```bash
chmod +x start-mock-llm.sh
./start-mock-llm.sh
```

### Metodo 3: Node.js diretto
```bash
node mock-llm-server.js
```

## ⚙️ Configurazione

### 1. Assicurati che il server mock sia avviato
Il server deve essere in esecuzione su `http://localhost:8000`

### 2. LibreChat è già configurato
L'endpoint "MockLLM" è già stato aggiunto al file `librechat.yaml`

### 3. Avvia LibreChat
Avvia normalmente LibreChat con:
```bash
npm run backend
npm run frontend
```

### 4. Usa l'endpoint Mock
- Apri LibreChat nel browser
- Seleziona "MockLLM" dal menu degli endpoints
- Scegli uno dei modelli: `mock-model-1` o `mock-model-2`
- Inizia a chattare!

## 🔧 Personalizzazione

### Modificare la risposta standard

Apri il file `mock-llm-server.js` e modifica la variabile `rispostaStandard` alla **riga 34**:

```javascript
const rispostaStandard = "La tua risposta personalizzata qui!";
```

### Modificare la porta

Nel file `mock-llm-server.js`, cambia la costante `PORT` (riga 7):

```javascript
const PORT = 8000; // Cambia questo valore
```

**NOTA**: Se cambi la porta, aggiorna anche il `baseURL` nel file `librechat.yaml`:

```yaml
- name: 'MockLLM'
  baseURL: 'http://localhost:NUOVA_PORTA/v1'
```

### Aggiungere risposte diverse in base al messaggio

Puoi modificare il server per rispondere in modo diverso in base al contenuto del messaggio:

```javascript
app.post('/v1/chat/completions', (req, res) => {
  const { messages } = req.body;
  const ultimoMessaggio = messages[messages.length - 1].content.toLowerCase();

  let rispostaStandard;

  if (ultimoMessaggio.includes('ciao')) {
    rispostaStandard = "Ciao! Come posso aiutarti?";
  } else if (ultimoMessaggio.includes('help')) {
    rispostaStandard = "Sono qui per aiutarti!";
  } else {
    rispostaStandard = "Risposta standard generica.";
  }

  // ... resto del codice
});
```

## 🔍 Endpoints disponibili

- **POST** `/v1/chat/completions` - Endpoint principale per chat
- **GET** `/v1/models` - Elenca i modelli disponibili
- **GET** `/health` - Health check del server

## 📊 Test del server

Puoi testare il server con curl:

```bash
# Test chat completion
curl -X POST http://localhost:8000/v1/chat/completions \
  -H "Content-Type: application/json" \
  -d '{
    "model": "mock-model-1",
    "messages": [{"role": "user", "content": "Ciao!"}]
  }'

# Test modelli disponibili
curl http://localhost:8000/v1/models

# Health check
curl http://localhost:8000/health
```

## 🐛 Risoluzione problemi

### Il server non si avvia
- Verifica che Node.js sia installato: `node --version`
- Verifica che Express sia installato: `npm install express`
- Controlla che la porta 8000 non sia già in uso

### LibreChat non si connette al mock server
- Verifica che il mock server sia in esecuzione
- Controlla che l'URL nel `librechat.yaml` sia corretto: `http://localhost:8000/v1`
- Riavvia LibreChat dopo aver modificato `librechat.yaml`

### Non vedo l'endpoint MockLLM nell'interfaccia
- Verifica che `librechat.yaml` sia stato salvato correttamente
- Riavvia completamente LibreChat
- Controlla i log del backend per eventuali errori di configurazione

## 📝 Note

- Il server mock supporta sia risposte normali che streaming
- Le risposte sono sempre le stesse indipendentemente dall'input
- Perfetto per test, demo e sviluppo
- Non adatto per produzione (è solo un mock!)

## 🎯 Prossimi passi

1. ✅ Avvia il mock server
2. ✅ Avvia LibreChat
3. ✅ Seleziona "MockLLM" nell'interfaccia
4. ✅ Testa la conversazione
5. 🎨 Personalizza le risposte a piacimento!
