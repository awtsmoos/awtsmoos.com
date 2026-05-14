
// B"H
const net = require("net");
const tls = require("tls");
const crypto = require("crypto");
const EventEmitter = require("events");

class TinyWebSocket extends EventEmitter {
  constructor(urlText) {
    super();
    this.url = new URL(urlText);
    this.socket = null;
    this.buffer = Buffer.alloc(0);
    this.opened = false;
    this.handshakeDone = false;
  }

  connect() {
    const secure = this.url.protocol === "wss:";
    const port = Number(this.url.port || (secure ? 443 : 80));
    const host = this.url.hostname;

    this.socket = secure
      ? tls.connect({ host, port, servername: host }, () => this.sendHandshake())
      : net.connect({ host, port }, () => this.sendHandshake());

    this.socket.on("data", chunk => this.onData(chunk));
    this.socket.on("error", err => this.emit("error", err));
    this.socket.on("close", () => this.emit("close"));
  }

  sendHandshake() {
    const key = crypto.randomBytes(16).toString("base64");
    const pathName = (this.url.pathname || "/") + (this.url.search || "");

    this.socket.write([
      "GET " + pathName + " HTTP/1.1",
      "Host: " + this.url.host,
      "Upgrade: websocket",
      "Connection: Upgrade",
      "Sec-WebSocket-Key: " + key,
      "Sec-WebSocket-Version: 13",
      "",
      ""
    ].join("\r\n"));
  }

  onData(chunk) {
    this.buffer = Buffer.concat([this.buffer, chunk]);

    if (!this.handshakeDone) {
      const marker = this.buffer.indexOf("\r\n\r\n");
      if (marker === -1) return;

      const head = this.buffer.slice(0, marker).toString("utf8");
      this.buffer = this.buffer.slice(marker + 4);

      if (!/^HTTP\/1\.1 101/i.test(head)) {
        this.emit("error", new Error("WebSocket handshake failed: " + head));
        this.socket.destroy();
        return;
      }

      this.handshakeDone = true;
      this.opened = true;
      this.emit("open");
    }

    this.readFrames();
  }

  readFrames() {
    while (this.buffer.length >= 2) {
      const first = this.buffer[0];
      const second = this.buffer[1];
      const opcode = first & 15;
      const masked = !!(second & 128);
      let offset = 2;
      let length = second & 127;

      if (length === 126) {
        if (this.buffer.length < offset + 2) return;
        length = this.buffer.readUInt16BE(offset);
        offset += 2;
      } else if (length === 127) {
        if (this.buffer.length < offset + 8) return;
        const high = this.buffer.readUInt32BE(offset);
        const low = this.buffer.readUInt32BE(offset + 4);
        length = high * 4294967296 + low;
        offset += 8;
      }

      let mask = null;

      if (masked) {
        if (this.buffer.length < offset + 4) return;
        mask = this.buffer.slice(offset, offset + 4);
        offset += 4;
      }

      if (this.buffer.length < offset + length) return;

      let payload = this.buffer.slice(offset, offset + length);
      this.buffer = this.buffer.slice(offset + length);

      if (masked) payload = this.unmask(payload, mask);

      if (opcode === 1) this.emit("message", payload.toString("utf8"));
      else if (opcode === 8) {
        this.close();
        return;
      } else if (opcode === 9) {
        this.sendFrame(10, payload);
      }
    }
  }

  unmask(payload, mask) {
    const out = Buffer.alloc(payload.length);
    for (let i = 0; i < payload.length; i++) out[i] = payload[i] ^ mask[i % 4];
    return out;
  }

  send(data) {
    this.sendFrame(1, Buffer.from(String(data), "utf8"));
  }

  sendJson(data) {
    this.send(JSON.stringify(data));
  }

  sendFrame(opcode, payload) {
    if (!this.socket || !this.opened) return;

    const length = payload.length;
    let header;

    if (length < 126) {
      header = Buffer.alloc(2);
      header[1] = 128 | length;
    } else if (length < 65536) {
      header = Buffer.alloc(4);
      header[1] = 128 | 126;
      header.writeUInt16BE(length, 2);
    } else {
      header = Buffer.alloc(10);
      header[1] = 128 | 127;
      header.writeUInt32BE(0, 2);
      header.writeUInt32BE(length, 6);
    }

    header[0] = 128 | opcode;

    const mask = crypto.randomBytes(4);
    const masked = Buffer.alloc(payload.length);

    for (let i = 0; i < payload.length; i++) masked[i] = payload[i] ^ mask[i % 4];

    this.socket.write(Buffer.concat([header, mask, masked]));
  }

  close() {
    this.opened = false;
    try { this.sendFrame(8, Buffer.alloc(0)); } catch (e) {}
    try { this.socket.end(); } catch (e) {}
  }
}

module.exports = { TinyWebSocket };
