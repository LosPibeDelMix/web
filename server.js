const express = require("express");
const Gamedig = require("gamedig");
const cors = require("cors");

const app = express();
app.use(cors());

// tus servidores
const servers = [
  { id: "mix", ip: "45.235.98.220", port: 27262, name: "[MIX] Los Pibes Del Mix" },
  { id: "publico", ip: "45.235.98.220", port: 27310, name: "[PUBLICO] Los Pibes Del Mix" },
  { id: "ttt", ip: "45.235.99.105", port: 27643, name: "[MATA AL TRAIDOR] Los Pibes Del Mix" },
];

app.get("/servers", async (req, res) => {
  const results = await Promise.all(servers.map(async (srv) => {
    try {
      const state = await Gamedig.query({
        type: "cs16",
        host: srv.ip,
        port: srv.port
      });
      return {
        id: srv.id,
        name: srv.name,
        ip: srv.ip,
        port: srv.port,
        online: true,
        players: state.players.length,
        maxPlayers: state.maxplayers,
        map: state.map
      };
    } catch (e) {
      return {
        id: srv.id,
        name: srv.name,
        ip: srv.ip,
        port: srv.port,
        online: false,
        players: 0,
        maxPlayers: 0,
        map: "-"
      };
    }
  }));
  res.json(results);
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`API corriendo en puerto ${PORT}`));
