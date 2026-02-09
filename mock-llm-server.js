/**
 * Mock LLM Server
 * Un server semplice che simula un endpoint LLM compatibile con OpenAI
 * Risponde sempre con una risposta standard predefinita
 */

const express = require('express');
const app = express();
const PORT = 8000;

// Middleware per parsing JSON
app.use(express.json());

// CORS - Permetti richieste da LibreChat
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }
  next();
});

// Log delle richieste
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// Endpoint per chat completions (compatibile con OpenAI API)
app.post('/v1/chat/completions', (req, res) => {
  const { messages, model, stream } = req.body;

  console.log('========================================');
  console.log('Richiesta ricevuta:');
  console.log('- Modello:', model);
  console.log('- Messaggi:', messages?.length || 0);
  console.log('- Stream:', stream);
  console.log('- Body completo:', JSON.stringify(req.body, null, 2));
  console.log('========================================');

  // Risposta standard
  const rispostaStandard = "Ciao";

  if (stream) {
    // Risposta in streaming (SSE - Server-Sent Events)
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');

    // Invia la risposta in chunks
    const words = rispostaStandard.split(' ');
    let sentWords = 0;

    const interval = setInterval(() => {
      if (sentWords < words.length) {
        const chunk = {
          id: `chatcmpl-${Date.now()}`,
          object: 'chat.completion.chunk',
          created: Math.floor(Date.now() / 1000),
          model: model || 'mock-model-1',
          choices: [{
            index: 0,
            delta: {
              content: words[sentWords] + ' '
            },
            finish_reason: null
          }]
        };
        res.write(`data: ${JSON.stringify(chunk)}\n\n`);
        sentWords++;
      } else {
        // Ultimo chunk
        const finalChunk = {
          id: `chatcmpl-${Date.now()}`,
          object: 'chat.completion.chunk',
          created: Math.floor(Date.now() / 1000),
          model: model || 'mock-model-1',
          choices: [{
            index: 0,
            delta: {},
            finish_reason: 'stop'
          }]
        };
        res.write(`data: ${JSON.stringify(finalChunk)}\n\n`);
        res.write('data: [DONE]\n\n');
        res.end();
        clearInterval(interval);
      }
    }, 50); // Invia una parola ogni 50ms per simulare streaming

  } else {
    // Risposta normale (non streaming)
    const response = {
      id: `chatcmpl-${Date.now()}`,
      object: 'chat.completion',
      created: Math.floor(Date.now() / 1000),
      model: model || 'mock-model-1',
      choices: [{
        index: 0,
        message: {
          role: 'assistant',
          content: rispostaStandard
        },
        finish_reason: 'stop'
      }],
      usage: {
        prompt_tokens: 10,
        completion_tokens: 20,
        total_tokens: 30
      }
    };

    res.json(response);
  }
});

// Endpoint per elencare i modelli disponibili
app.get('/v1/models', (req, res) => {
  res.json({
    object: 'list',
    data: [
      {
        id: 'mock-model-1',
        object: 'model',
        created: Math.floor(Date.now() / 1000),
        owned_by: 'mock-organization'
      },
      {
        id: 'mock-model-2',
        object: 'model',
        created: Math.floor(Date.now() / 1000),
        owned_by: 'mock-organization'
      }
    ]
  });
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'ok', message: 'Mock LLM Server is running' });
});

// Avvia il server
app.listen(PORT, () => {
  console.log('╔════════════════════════════════════════════════════════╗');
  console.log('║         🤖 Mock LLM Server Avviato!                   ║');
  console.log('╠════════════════════════════════════════════════════════╣');
  console.log(`║  Server in ascolto su: http://localhost:${PORT}        ║`);
  console.log('║  Endpoint disponibili:                                 ║');
  console.log(`║  - POST http://localhost:${PORT}/v1/chat/completions   ║`);
  console.log(`║  - GET  http://localhost:${PORT}/v1/models             ║`);
  console.log(`║  - GET  http://localhost:${PORT}/health                ║`);
  console.log('╠════════════════════════════════════════════════════════╣');
  console.log('║  Per modificare la risposta standard, edita la        ║');
  console.log('║  variabile "rispostaStandard" nel file                 ║');
  console.log('║  mock-llm-server.js (riga 34)                          ║');
  console.log('╚════════════════════════════════════════════════════════╝');
  console.log('');
  console.log('Premi Ctrl+C per fermare il server');
  console.log('');
});

// Gestione errori
app.use((err, req, res, next) => {
  console.error('Errore:', err);
  res.status(500).json({ error: 'Internal server error', message: err.message });
});
