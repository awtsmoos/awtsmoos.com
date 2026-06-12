//B"H
const http = require("http");
const { createHash } = require("crypto");
const { log } = require("./logger.cjs");

let bridgeServer = null;
const clients = new Set();

/**
 * Chapter 16: The Bridge Burned The Borrowed Ladder.
 *
 * No `ws` package stands between Node and the browser. The Awtsmoos lets the raw
 * HTTP upgrade become a WebSocket by hand: accept key, frame text, unmask client
 * packets, and broadcast commands to every local tab that has joined the relay.
 *
 * @param {number} port Port to listen on.
 * @returns {import('http').Server} Raw WebSocket bridge server.
 */
function startBrowserBridge(port = 39505) {
  if (bridgeServer) return bridgeServer;
  bridgeServer = http.createServer((req, res) => {
    res.writeHead(426, { "content-type": "text/plain" });
    res.end("B\"H WebSocket upgrade required.");
  });
  bridgeServer.on("upgrade", (req, socket) => acceptUpgrade(req, socket));
  bridgeServer.listen(port, "127.0.0.1", () => log({ verbose: true }, "browser-bridge", { port }));
  return bridgeServer;
}

/**
 * @param {object} cmd Command object sent to all connected browser clients.
 * @returns {number} Number of clients that received the command.
 */
function broadcastCommand(cmd) {
  const text = JSON.stringify(cmd);
  let sent = 0;
  for (const socket of clients) {
    if (!socket.destroyed) {
      socket.write(frameText(text));
      sent++;
    }
  }
  return sent;
}

function acceptUpgrade(req, socket) {
  const key = req.headers["sec-websocket-key"];
  if (!key) return socket.destroy();
  const accept = createHash("sha1").update(key + "258EAFA5-E914-47DA-95CA-C5AB0DC85B11").digest("base64");
  socket.write(`HTTP/1.1 101 Switching Protocols\r\nUpgrade: websocket\r\nConnection: Upgrade\r\nSec-WebSocket-Accept: ${accept}\r\n\r\n`);
  clients.add(socket);
  let buffer = Buffer.alloc(0);
  socket.on("data", chunk => {
    buffer = consume(Buffer.concat([buffer, chunk]), socket);
  });
  socket.on("close", () => clients.delete(socket));
  socket.on("error", () => clients.delete(socket));
}

function consume(buffer, socket) {
  while (buffer.length >= 2) {
    const lenFlag = buffer[1] & 127;
    const masked = Boolean(buffer[1] & 128);
    const header = lenFlag === 126 ? 4 : lenFlag === 127 ? 10 : 2;
    const size = lenFlag === 126 ? buffer.readUInt16BE(2) : lenFlag === 127 ? Number(buffer.readBigUInt64BE(2)) : lenFlag;
    const maskBytes = masked ? 4 : 0;
    if (buffer.length < header + maskBytes + size) break;
    const mask = masked ? buffer.slice(header, header + 4) : null;
    const start = header + maskBytes;
    const payload = Buffer.from(buffer.slice(start, start + size));
    if (mask) for (let i = 0; i < payload.length; i++) payload[i] ^= mask[i % 4];
    handleMessage(payload.toString("utf8"), socket);
    buffer = buffer.slice(start + size);
  }
  return buffer;
}

function handleMessage(text, socket) {
  const data = safeJson(text);
  if (!data) return;
  if (data.type === "ping") socket.write(frameText(JSON.stringify({ type: "pong", at: Date.now() })));
  if (data.type === "storage-get") socket.write(frameText(JSON.stringify({ id: data.id, result: null, error: "browser execution required" })));
}

function frameText(text) {
  const body = Buffer.from(text);
  if (body.length < 126) return Buffer.concat([Buffer.from([129, body.length]), body]);
  if (body.length < 65536) return Buffer.concat([Buffer.from([129, 126, body.length >> 8, body.length & 255]), body]);
  const head = Buffer.alloc(10);
  head[0] = 129;
  head[1] = 127;
  head.writeBigUInt64BE(BigInt(body.length), 2);
  return Buffer.concat([head, body]);
}

function safeJson(text) { try { return JSON.parse(text); } catch { return null; } }

module.exports = { startBrowserBridge, broadcastCommand };
