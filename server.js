const WebSocket = require("ws");

const wss = new WebSocket.Server({ port: 8080 });

const players = {};

/* =========================
   ID GENERATOR
========================= */
function makeId() {
  return Math.random().toString(36).slice(2, 10);
}

/* =========================
   CONNECTION
========================= */
wss.on("connection", (ws) => {
  const id = makeId();
  console.log(`Player connected: ${id}`);

  players[id] = {
    x: 0,
    y: 2,
    z: 0,
    name: "Player"
  };

  ws.id = id;

  // send client their id immediately
  ws.send(JSON.stringify({
    type: "id",
    id
  }));

  /* =========================
     MESSAGES FROM CLIENT
  ========================= */
  ws.on("message", (msg) => {
    let data;

    try {
      data = JSON.parse(msg);
    } catch {
      return; // ignore broken packets
    }

    const p = players[id];
    if (!p) return;

    /* POSITION UPDATE */
    if (data.type === "pos") {
      if (typeof data.x === "number") p.x = data.x;
      if (typeof data.y === "number") p.y = data.y;
      if (typeof data.z === "number") p.z = data.z;
    }

    /* NAME UPDATE */
    if (data.type === "name") {
      if (typeof data.name === "string") {
        p.name = data.name.slice(0, 16); // limit length
      }
    }
  });

  /* =========================
     DISCONNECT CLEANUP
  ========================= */
  ws.on("close", () => {
    delete players[id];
  });
});

/* =========================
   BROADCAST LOOP
========================= */
setInterval(() => {
  const packet = JSON.stringify({
    type: "state",
    players
  });

  for (const client of wss.clients) {
    if (client.readyState === WebSocket.OPEN) {
      client.send(packet);
    }
  }
}, 50);

console.log("WS server running on ws://localhost:8080");