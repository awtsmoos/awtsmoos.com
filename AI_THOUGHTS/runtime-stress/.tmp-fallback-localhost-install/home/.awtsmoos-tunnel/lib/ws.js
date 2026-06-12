
// B"H
const net = require("net");
const tls = require("tls");
const crypto = require("crypto");
const { URL } = require("url");
const EventEmitter = require("events");

const MAX_BUFFER_BYTES = Number(process.env.AWTSMOOS_WS_MAX_BUFFER || 128 * 1024 * 1024);
const MAX_FRAME_BYTES = Number(process.env.AWTSMOOS_WS_MAX_FRAME || 96 * 1024 * 1024);

class TinyWebSocket extends EventEmitter {
  constructor(address) {
    super();
    this.address = address;
    this.socket = null;
    this.buffer = Buffer.alloc(0);
    this.opened = false;
    this.closed = false;
    this.handshaken = false;
  }

  connect() {
    const url = new URL(this.address);
    const isSecure = url.protocol === "wss:";
    const port = Number(url.port || (isSecure ? 443 : 80));
    const host = url.hostname;
    const requestPath = (url.pathname || "/") + (url.search || "");
    const key = crypto.randomBytes(16).toString("base64");

    const req = [
      "GET " + requestPath + " HTTP/1.1",
      "Host: " + host,
      "Upgrade: websocket",
      "Connection: Upgrade",
      "Sec-WebSocket-Key: " + key,
      "Sec-WebSocket-Version: 13",
      "",
      ""
    ].join("\r\n");

    const socket = isSecure
      ? tls.connect(port, host, () => socket.write(req))
      : net.connect(port, host, () => socket.write(req));

    this.socket = socket;

    let handshake = Buffer.alloc(0);

    socket.on("data", chunk => {
      if (this.closed) return;

      if (!this.handshaken) {
        handshake = Buffer.concat([handshake, chunk]);

        if (handshake.length > 1024 * 1024) {
          this.fail(new Error("WebSocket handshake too large."));
          return;
        }

        const end = handshake.indexOf("\r\n\r\n");
        if (end === -1) return;

        const head = handshake.slice(0, end).toString("utf8");

        if (!/^HTTP\/1\.1 101/i.test(head)) {
          this.fail(new Error("WebSocket handshake failed: " + head.split("\r\n")[0]));
          return;
        }

        this.handshaken = true;
        this.opened = true;
        this.emit("open");

        const rest = handshake.slice(end + 4);
        handshake = null;

        if (rest.length) this._onFrameData(rest);
        return;
      }

      this._onFrameData(chunk);
    });

    socket.once("close", () => this.finishClose());
    socket.once("end", () => this.finishClose());
    socket.once("error", err => {
      this.emit("error", err);
      this.finishClose();
    });
  }

  fail(err) {
    this.emit("error", err);
    this.close(true);
  }

  finishClose() {
    if (this.closed) return;

    this.closed = true;
    this.opened = false;
    this.buffer = Buffer.alloc(0);

    if (this.socket) {
      this.socket.removeAllListeners("data");
      this.socket.removeAllListeners("close");
      this.socket.removeAllListeners("end");
      this.socket.removeAllListeners("error");
      try { this.socket.destroy(); } catch (_e) {}
    }

    this.emit("close");
  }

  _onFrameData(chunk) {
    if (this.closed) return;

    this.buffer = Buffer.concat([this.buffer, chunk]);

    if (this.buffer.length > MAX_BUFFER_BYTES) {
      this.fail(new Error("WebSocket receive buffer exceeded " + MAX_BUFFER_BYTES + " bytes."));
      return;
    }

    while (true) {
      let parsed;

      try {
        parsed = this._readFrame(this.buffer);
      } catch (e) {
        this.fail(e);
        return;
      }

      if (!parsed) return;

      this.buffer = this.buffer.slice(parsed.consumed);

      if (parsed.opcode === 0x8) {
        this.close(true);
        return;
      }

      if (parsed.opcode === 0x9) {
        this._sendFrame(parsed.payload, 0xA);
        continue;
      }

      if (parsed.opcode === 0xA) continue;

      if (parsed.opcode === 0x1) {
        this.emit("message", parsed.payload.toString("utf8"));
        continue;
      }

      if (parsed.opcode === 0x2) {
        this.emit("message", parsed.payload);
        continue;
      }
    }
  }

  _readFrame(buf) {
    if (buf.length < 2) return null;

    const b0 = buf[0];
    const b1 = buf[1];
    const opcode = b0 & 0x0f;
    const masked = !!(b1 & 0x80);

    let len = b1 & 0x7f;
    let offset = 2;

    if (len === 126) {
      if (buf.length < offset + 2) return null;
      len = buf.readUInt16BE(offset);
      offset += 2;
    } else if (len === 127) {
      if (buf.length < offset + 8) return null;

      const big = buf.readBigUInt64BE(offset);
      offset += 8;

      if (big > BigInt(Number.MAX_SAFE_INTEGER)) {
        throw new Error("WebSocket frame too large for this Node process.");
      }

      len = Number(big);
    }

    if (len > MAX_FRAME_BYTES) {
      throw new Error("WebSocket frame exceeded " + MAX_FRAME_BYTES + " bytes.");
    }

    let mask = null;

    if (masked) {
      if (buf.length < offset + 4) return null;
      mask = buf.slice(offset, offset + 4);
      offset += 4;
    }

    if (buf.length < offset + len) return null;

    const payload = Buffer.from(buf.slice(offset, offset + len));

    if (masked && mask) {
      for (let i = 0; i < payload.length; i++) {
        payload[i] ^= mask[i % 4];
      }
    }

    return { opcode, payload, consumed: offset + len };
  }

  _sendFrame(data, opcode = 0x1) {
    if (!this.socket || !this.opened || this.closed) return;

    const payload = Buffer.isBuffer(data) ? data : Buffer.from(String(data), "utf8");
    const len = payload.length;
    const mask = crypto.randomBytes(4);
    let header;

    if (len < 126) {
      header = Buffer.alloc(2);
      header[0] = 0x80 | opcode;
      header[1] = 0x80 | len;
    } else if (len < 65536) {
      header = Buffer.alloc(4);
      header[0] = 0x80 | opcode;
      header[1] = 0x80 | 126;
      header.writeUInt16BE(len, 2);
    } else {
      header = Buffer.alloc(10);
      header[0] = 0x80 | opcode;
      header[1] = 0x80 | 127;
      header.writeBigUInt64BE(BigInt(len), 2);
    }

    const masked = Buffer.allocUnsafe(payload.length);

    for (let i = 0; i < payload.length; i++) {
      masked[i] = payload[i] ^ mask[i % 4];
    }

    this.socket.write(Buffer.concat([header, mask, masked]));
  }

  send(text) {
    this._sendFrame(Buffer.from(String(text), "utf8"), 0x1);
  }

  sendJson(obj) {
    this.send(JSON.stringify(obj));
  }

  close(force = false) {
    if (this.closed) return;

    try {
      if (!force && this.opened) this._sendFrame(Buffer.alloc(0), 0x8);
    } catch (_e) {}

    try {
      if (force && this.socket) this.socket.destroy();
      else if (this.socket) this.socket.end();
    } catch (_e) {}

    if (force) this.finishClose();
  }
}

module.exports = { TinyWebSocket };
