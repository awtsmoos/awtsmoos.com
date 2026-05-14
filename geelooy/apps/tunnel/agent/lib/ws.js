
// B"H

const net = require("net");
const tls = require("tls");
const crypto = require("crypto");
const { URL } = require("url");
const EventEmitter = require("events");

/**
 * B"H
 * Tiny WebSocket client.
 *
 * Important fix:
 * WebSocket payload lengths must be calculated from UTF-8 bytes, NOT
 * JavaScript string length. Hebrew and other multibyte characters corrupt
 * frames if string.length is used.
 */
class TinyWebSocket extends EventEmitter {
  constructor(address) {
    super();
    this.address = address;
    this.socket = null;
    this.buffer = Buffer.alloc(0);
    this.opened = false;
  }

  connect() {
    const url = new URL(this.address);
    const isSecure = url.protocol === "wss:";
    const port = Number(url.port || (isSecure ? 443 : 80));
    const host = url.hostname;
    const path = (url.pathname || "/") + (url.search || "");

    const key = crypto.randomBytes(16).toString("base64");

    const req = [
      "GET " + path + " HTTP/1.1",
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
    let handshaken = false;

    socket.on("data", chunk => {
      if (!handshaken) {
        handshake = Buffer.concat([handshake, chunk]);
        const end = handshake.indexOf("\r\n\r\n");

        if (end === -1) return;

        const head = handshake.slice(0, end).toString("utf8");

        if (!/^HTTP\/1\.1 101/i.test(head)) {
          this.emit("error", new Error("WebSocket handshake failed: " + head.split("\r\n")[0]));
          socket.end();
          return;
        }

        handshaken = true;
        this.opened = true;
        this.emit("open");

        const rest = handshake.slice(end + 4);
        if (rest.length) this._onFrameData(rest);

        return;
      }

      this._onFrameData(chunk);
    });

    socket.on("close", () => {
      this.opened = false;
      this.emit("close");
    });

    socket.on("error", err => {
      this.emit("error", err);
    });
  }

  _onFrameData(chunk) {
    this.buffer = Buffer.concat([this.buffer, chunk]);

    while (true) {
      const parsed = this._readFrame(this.buffer);
      if (!parsed) return;

      this.buffer = this.buffer.slice(parsed.consumed);

      if (parsed.opcode === 0x8) {
        this.opened = false;
        this.socket.end();
        this.emit("close");
        return;
      }

      if (parsed.opcode === 0x9) {
        this._sendFrame(parsed.payload, 0xA);
        continue;
      }

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

      const high = buf.readUInt32BE(offset);
      const low = buf.readUInt32BE(offset + 4);
      offset += 8;

      if (high !== 0) {
        throw new Error("WebSocket frame too large.");
      }

      len = low;
    }

    let mask = null;

    if (masked) {
      if (buf.length < offset + 4) return null;
      mask = buf.slice(offset, offset + 4);
      offset += 4;
    }

    if (buf.length < offset + len) return null;

    let payload = Buffer.from(buf.slice(offset, offset + len));

    if (masked && mask) {
      for (let i = 0; i < payload.length; i++) {
        payload[i] ^= mask[i % 4];
      }
    }

    return {
      opcode,
      payload,
      consumed: offset + len
    };
  }

  _sendFrame(data, opcode = 0x1) {
    if (!this.socket || !this.opened) return;

    const payload = Buffer.isBuffer(data)
      ? data
      : Buffer.from(String(data), "utf8");

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
      header.writeUInt32BE(0, 2);
      header.writeUInt32BE(len, 6);
    }

    const masked = Buffer.alloc(payload.length);

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

  close() {
    if (!this.socket) return;
    this._sendFrame(Buffer.alloc(0), 0x8);
    this.socket.end();
  }
}

module.exports = { TinyWebSocket };
