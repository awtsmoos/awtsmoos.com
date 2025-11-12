// B"H
// Yesod-Utilities.js: Foundation - Low-Level Tools

'use strict';

const zlib = require('zlib');

function readUInt32BE(buf, offset = 0) {
  return buf.readUInt32BE(offset);
}

function writeUInt32BE(buf, value, offset = 0) {
  return buf.writeUInt32BE(value, offset);
}

// A simple Buffer reader class used across the library
class BufferReader {
  constructor(buffer) {
    this.buffer = buffer;
    this.pos = 0;
  }
  
  avail() {
    return this.buffer.length - this.pos;
  }

  readUInt32BE() {
    if (this.pos + 4 > this.buffer.length) return;
    const val = this.buffer.readUInt32BE(this.pos);
    this.pos += 4;
    return val;
  }
  
  readBytes(len) {
    if (this.pos + len > this.buffer.length) return;
    const slice = this.buffer.slice(this.pos, this.pos + len);
    this.pos += len;
    return slice;
  }
  
  readString(encoding) {
    const len = this.readUInt32BE();
    if (len === undefined || this.pos + len > this.buffer.length) return;
    const data = this.buffer.slice(this.pos, this.pos + len);
    this.pos += len;
    return encoding === null ? data : data.toString(encoding);
  }

  readBool() {
    if (this.pos >= this.buffer.length) return;
    return this.buffer[this.pos++] !== 0;
  }
}

// Wrapper classes for packet compression/decompression
class ZlibPacketReader {
    constructor() {
        this._z = new zlib.Inflate();
    }
    read(payload) {
        return this._z.write(payload); // Simplification: assuming sync flush
    }
    cleanup() {
        this._z.close();
    }
}

class ZlibPacketWriter {
    constructor(protocol) {
        this._protocol = protocol;
        this._z = new zlib.Deflate();
    }
    // Simplification for now. Real implementation needs to handle packetizing.
    alloc(len) { return Buffer.alloc(len); }
    finalize(packet) { return this._z.write(packet); }
    cleanup() {
        this._z.close();
    }
}

// Placeholder for uncompressed packet I/O
class PacketReader {
    read(payload) { return payload; }
    cleanup() {}
}
class PacketWriter {
    constructor(protocol) {
        this._protocol = protocol;
        // In a real scenario, this would track packet sequence, etc.
        this.allocStart = 5;
    }
    alloc(len, kex = false) { return Buffer.alloc(len + 5); }
    finalize(packet, kex = false) { return packet; }
    cleanup() {}
}

module.exports = {
  readUInt32BE,
  writeUInt32BE,
  BufferReader,
  ZlibPacketReader,
  ZlibPacketWriter,
  PacketReader,
  PacketWriter
};