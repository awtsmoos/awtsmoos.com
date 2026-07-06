// B"H
const { writeHandshake } = require("./websocket/core/handshake.js");
const { readFrame } = require("./websocket/core/frameReader.js");
const { sendFrame } = require("./websocket/core/frameWriter.js");
const Live = require("./websocket/core/clientLiveness.js");
const { routeMessage } = require("./websocket/apps/messageRouter.js");
const { sendToAlias } = require("./websocket/apps/aliasRouting.js");
const { sendTunnelRequest } = require("./websocket/apps/tunnelRelay.js");
const { forgetClient } = require("./websocket/apps/socialLive.js");

class AwtsmoosSocket {
  constructor(db) {
    this.db = db; this.clients = new Set(); this.aliasMap = new Map(); this.tunnels = new Map();
    this.pendingTunnelRequests = new Map(); this.settingsCache = new Map();
    setInterval(() => this.heartbeat(), 30000).unref?.();
    setInterval(() => this.settingsCache.clear(), 60000).unref?.();
  }
  handleUpgrade(req, socket, head) {
    if (!writeHandshake(req, socket)) return;
    const client = this.makeClient(socket);
    this.clients.add(client); console.log("B\"H - Socket Connected:", client.id);
    if (head && head.length) this.processBuffer(client, head);
    socket.on("data", chunk => this.processBuffer(client, chunk));
    socket.on("close", () => this.removeClient(client)); socket.on("error", () => this.removeClient(client));
  }
  makeClient(socket) {
    const client = { id: Date.now() + "_" + Math.random().toString(36).slice(2), socket, aliasId:null, isAlive:true, buffer:Buffer.alloc(0), fragments:[], fragmentOpcode:null, send:msg => sendFrame(socket, typeof msg === "string" ? msg : JSON.stringify(msg)) };
    Live.markSeen(client); return client;
  }
  processBuffer(client, chunk) {
    Live.markSeen(client); client.buffer = Buffer.concat([client.buffer || Buffer.alloc(0), chunk]);
    while (client.buffer.length) { let parsed; try { parsed = readFrame(client.buffer); } catch (e) { console.log("B\"H WS FRAME ERROR", e.message); client.socket.end(); return; } if (!parsed) return; client.buffer = client.buffer.slice(parsed.consumed); this.handleFrame(client, parsed.frame); }
  }
  handleFrame(client, frame) {
    Live.markSeen(client);
    if (frame.opcode === 0x8) return client.socket.end();
    if (frame.opcode === 0x9) return sendFrame(client.socket, frame.payload, 0xA);
    if (frame.opcode === 0xA) return;
    if (frame.opcode === 0x1 || frame.opcode === 0x0) { const message = this.collectMessage(client, frame); if (message !== null) routeMessage(this, client, message); }
  }
  collectMessage(client, frame) {
    if (frame.opcode === 0x1 && frame.fin) return frame.payload.toString("utf8");
    if (frame.opcode === 0x1) { client.fragmentOpcode = 0x1; client.fragments = [frame.payload]; return null; }
    if (frame.opcode === 0x0 && client.fragmentOpcode === 0x1) { client.fragments.push(frame.payload); if (!frame.fin) return null; const msg = Buffer.concat(client.fragments).toString("utf8"); client.fragments = []; client.fragmentOpcode = null; return msg; }
    return null;
  }
  removeClient(client) {
    forgetClient(this, client); this.clients.delete(client); this.removeAlias(client);
    if (client.isTunnel && client.tunnelName && this.tunnels.get(client.tunnelName) === client) this.tunnels.delete(client.tunnelName);
  }
  removeAlias(client) { if (!client.aliasId) return; const set = this.aliasMap.get(client.aliasId); if (set) { set.delete(client); if (set.size === 0) this.aliasMap.delete(client.aliasId); } }
  heartbeat() {
    const now = Date.now();
    for (const client of this.clients) { if (Live.shouldTerminate(client, now)) { console.log("Terminating stale socket after heartbeat grace:", client.id); client.socket.end(); continue; } Live.markHeartbeatSent(client, now); sendFrame(client.socket, Buffer.alloc(0), 0x9); }
  }
  sendTunnelRequest(name, payload, timeout) { return sendTunnelRequest(this, name, payload, timeout); }
  sendToAlias(targetAlias, data) { return sendToAlias(this, targetAlias, data); }
  broadcastAll(data) { for (const client of this.clients) client.send(data); }
  sendFrame(socket, data, opcode = 0x1) { return sendFrame(socket, data, opcode); }
}
module.exports = AwtsmoosSocket;
