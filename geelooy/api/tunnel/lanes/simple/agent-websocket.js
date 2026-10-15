// B"H — Simple tunnel lane: WebSocket (Yaakov 2026-10-15)
// Real WebSocket lane using AwtsmoosSocket infrastructure.
// Connects to wss://awtsmoos.com, LOGINs with alias, receives commands via WS.

const { exec } = require("node:child_process");
const { EventEmitter } = require("node:events");

const WS_URL = process.env.TUNNEL_WS_URL || "wss://awtsmoos.com";
const AGENT_ID = process.env.TUNNEL_AGENT_ID || require("node:os").hostname();
const SECRET = process.env.TUNNEL_SECRET || "";

// B"H — Minimal WebSocket client using Node built-ins (no external deps)
class SimpleWS extends EventEmitter {
  constructor(url) {
    super();
    this.url = url;
    this.socket = null;
  }

  connect() {
    const url = new URL(this.url);
    const isSecure = url.protocol === "wss:";
    const net = isSecure ? require("node:https") : require("node:http");
    const crypto = require("node:crypto");

    const key = crypto.randomBytes(16).toString("base64");
    const options = {
      hostname: url.hostname,
      port: url.port || (isSecure ? 443 : 80),
      path: url.pathname + url.search,
      headers: {
        "Upgrade": "websocket",
        "Connection": "Upgrade",
        "Sec-WebSocket-Key": key,
        "Sec-WebSocket-Version": "13"
      }
    };

    const req = (isSecure ? require("node:https") : require("node:http")).request(options);
    req.on("upgrade", (res, socket, head) => {
      console.log("[tunnel] WebSocket connected");
      this.socket = socket;
      this.emit("open");
      let buffer = Buffer.alloc(0);
      socket.on("data", (chunk) => {
        buffer = Buffer.concat([buffer, chunk]);
        // B"H — Minimal frame parsing (text frames only)
        while (buffer.length >= 2) {
          const opcode = buffer[0] & 0x0f;
          const masked = (buffer[1] & 0x80) !== 0;
          let payloadLen = buffer[1] & 0x7f;
          let offset = 2;
          if (payloadLen === 126) {
            payloadLen = buffer.readUInt16BE(2);
            offset = 4;
          } else if (payloadLen === 127) {
            payloadLen = Number(buffer.readBigUInt64BE(2));
            offset = 10;
          }
          if (masked) offset += 4;
          if (buffer.length < offset + payloadLen) break;
          if (opcode === 0x1) { // text frame
            const payload = buffer.slice(offset, offset + payloadLen).toString("utf8");
            this.emit("message", payload);
          } else if (opcode === 0x8) { // close
            this.emit("close");
            return;
          }
          buffer = buffer.slice(offset + payloadLen);
        }
      });
      socket.on("close", () => this.emit("close"));
      socket.on("error", (e) => this.emit("error", e));
    });
    req.on("error", (e) => this.emit("error", e));
    req.end();
  }

  send(data) {
    if (!this.socket) return;
    const payload = Buffer.from(data, "utf8");
    const frame = Buffer.alloc(2 + payload.length);
    frame[0] = 0x81; // FIN + text
    frame[1] = payload.length;
    payload.copy(frame, 2);
    this.socket.write(frame);
  }

  sendJson(obj) {
    this.send(JSON.stringify(obj));
  }
}

function executeCommand(command, id, ws) {
  console.log(`[tunnel] Executing via WS: ${command.slice(0, 60)}`);
  exec(command, { timeout: 60000, maxBuffer: 1024 * 1024 }, (err, stdout, stderr) => {
    const output = (stdout || "") + (stderr || "");
    ws.sendJson({
      type: "command_result",
      id: id,
      agentId: AGENT_ID,
      output: output.slice(0, 50000),
      exitCode: err ? (err.code || 1) : 0
    });
    console.log(`[tunnel] Result sent for ${id}`);
  });
}

// B"H — HTTP polling fallback (same as agent-poll.js, simplified)
const SERVER = process.env.TUNNEL_SERVER || "https://awtsmoos.com";
function api(path, method = "GET", body = null) {
  return new Promise((resolve) => {
    const url = new URL(SERVER + path);
    const lib = url.protocol === "https:" ? require("node:https") : require("node:http");
    const data = body ? JSON.stringify(body) : null;
    const req = lib.request({
      hostname: url.hostname,
      port: url.port || (url.protocol === "https:" ? 443 : 80),
      path: url.pathname + url.search,
      method: method,
      headers: { "Content-Type": "application/json", ...(data ? { "Content-Length": Buffer.byteLength(data) } : {}) },
      timeout: 15000
    }, (res) => {
      let d = "";
      res.on("data", c => d += c);
      res.on("end", () => { try { resolve(JSON.parse(d)); } catch { resolve(null); } });
    });
    req.on("error", () => resolve(null));
    req.on("timeout", () => { req.destroy(); resolve(null); });
    if (data) req.write(data);
    req.end();
  });
}

async function startPolling() {
  console.log("[tunnel] HTTP polling fallback active");
  while (true) {
    try {
      const res = await api(`/api/tunnel/control/simple/poll?agentId=${encodeURIComponent(AGENT_ID)}&secret=${encodeURIComponent(SECRET)}`);
      if (res && res.command) {
        console.log(`[tunnel] Poll got command: ${res.command.slice(0, 60)}`);
        exec(res.command, { timeout: 60000, maxBuffer: 1024 * 1024 }, async (err, stdout, stderr) => {
          await api(`/api/tunnel/control/simple/result`, "POST", {
            secret: SECRET,
            id: res.id,
            output: ((stdout || "") + (stderr || "")).slice(0, 50000)
          });
          console.log(`[tunnel] Poll result posted for ${res.id}`);
        });
      }
    } catch (e) {}
    await new Promise(r => setTimeout(r, 3000));
  }
}

function main() {
  console.log(`[tunnel] WebSocket lane starting (agent: ${AGENT_ID})`);
  console.log(`[tunnel] Connecting to ${WS_URL}...`);

  // B"H — Yaakov 2026-10-15: Dual transport. WS for real-time push,
  // HTTP polling as reliable fallback. Both use the same command queue.
  startPolling();

  const ws = new SimpleWS(WS_URL);

  ws.on("open", () => {
    // B"H — LOGIN with tunnel alias (matches server's alias routing)
    ws.sendJson({
      type: "LOGIN",
      aliasId: `tunnel:${AGENT_ID}`,
      agentId: AGENT_ID,
      secret: SECRET
    });
    console.log(`[tunnel] LOGIN sent as tunnel:${AGENT_ID}`);
  });

  ws.on("message", (data) => {
    try {
      const msg = JSON.parse(data);
      if (msg.type === "command" && msg.command) {
        executeCommand(msg.command, msg.id, ws);
      } else if (msg.type === "ping") {
        ws.sendJson({ type: "pong" });
      }
    } catch (e) {
      console.log(`[tunnel] Message parse error: ${e.message}`);
    }
  });

  ws.on("close", () => {
    console.log("[tunnel] WebSocket closed, reconnecting in 5s...");
    setTimeout(main, 5000);
  });

  ws.on("error", (e) => {
    console.log(`[tunnel] WebSocket error: ${e.message}, reconnecting in 5s...`);
    setTimeout(main, 5000);
  });

  ws.connect();
}

main();
