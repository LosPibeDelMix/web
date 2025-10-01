// server.js
const express = require('express');
const cors = require('cors');
const Gamedig = require('gamedig');

const app = express();
app.use(cors()); // permite peticiones desde tu web

// Lista de servidores que queremos consultar
const servers = [
  { id: 'mix', name: '[MIX] Los Pibes Del Mix', ip: '45.235.98.220', port: 27262, type: 'cs16' },
  { id: 'publico', name: '[PUBLICO] Los Pibes Del Mix', ip: '45.235.98.220', port: 27310, type: 'cs16' },
  { id: 'ttt', name: '[MATA AL TRAIDOR] Los Pibes Del Mix', ip: '45.235.99.105', port: 27643, type: 'cs16' },
];

// Caché simple en memoria para no saturar consultas (TTL en ms)
const cache = {};
const CACHE_TTL = 10 * 1000; // 10 segundos

async function queryServer(srv) {
  const cacheKey = `${srv.ip}:${srv.port}`;
  const now = Date.now();

  if (cache[cacheKey] && (now - cache[cacheKey].ts < CACHE_TTL)) {
    return cache[cacheKey].data;
  }

  try {
    const state = await Gamedig.query({
      type: srv.type, // 'cs16' para CS 1.6, ajustá si es necesario
      host: srv.ip,
      port: srv.port,
      socketTimeout: 3000,
    });

    const result = {
      id: srv.id,
      name: srv.name,
      ip: srv.ip,
      port: srv.port,
      online: true,
      players: state.players ? state.players.length : 0,
      maxPlayers: state.maxplayers || state.max_players || 0,
      map: state.map || state.game || '-',
      rawPlayers: state.players || [],
      ping: state.ping || null
    };

    cache[cacheKey] = { ts: now, data: result };
    return result;
  } catch (err) {
    // servidor offline o fallo -> devolver offline
    const result = {
      id: srv.id,
      name: srv.name,
      ip: srv.ip,
      port: srv.port,
      online: false,
      players: 0,
      maxPlayers: 0,
      map: '-',
      rawPlayers: [],
      ping: null
    };
    cache[cacheKey] = { ts: now, data: result };
    return result;
  }
}

app.get('/servers', async (req, res) => {
  try {
    const promises = servers.map(s => queryServer(s));
    const data = await Promise.all(promises);
    res.json({ success: true, servers: data, ts: Date.now() });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`API de servidores corriendo en http://localhost:${PORT} (PUERTO ${PORT})`));
