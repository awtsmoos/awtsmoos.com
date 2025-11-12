// B"H
// Yesod-Utilities.js: Foundation - Low-Level Tools

'use strict';
const Poly1305 = (() => {
    const BI_ZERO = BigInt(0);
    const P = BigInt('0x3fffffffffffffffffffffffffffffffb'); // 2^130 - 5

    const leToBigInt = (buf) => {
        let n = BI_ZERO;
        for (let i = buf.length - 1; i >= 0; i--) {
            n = (n << BigInt(8)) + BigInt(buf[i]);
        }
        return n;
    };

    const bigIntToLe = (n, len) => {
        const buf = Buffer.alloc(len);
        for (let i = 0; i < len; i++) {
            buf[i] = Number(n & BigInt(0xff));
            n >>= BigInt(8);
        }
        return buf;
    };

    return {
        tag: (key, data) => {
            const r_buf = key.slice(0, 16);
            const s_buf = key.slice(16, 32);

            r_buf[3] &= 15; r_buf[7] &= 15; r_buf[11] &= 15; r_buf[15] &= 15;
            r_buf[4] &= 252; r_buf[8] &= 252; r_buf[12] &= 252;

            const r = leToBigInt(r_buf);
            const s = leToBigInt(s_buf);

            let a = BI_ZERO;
            const block_size = 16;

            for (let i = 0; i < data.length; i += block_size) {
                const block = data.slice(i, i + block_size);
                const n_buf = Buffer.alloc(block.length + 1, 0);
                block.copy(n_buf, 0);
                n_buf[block.length] = 1;

                const n = leToBigInt(n_buf);
                a += n;
                a = (r * a) % P;
            }

            const final_tag_n = a + s;
            return bigIntToLe(final_tag_n, 16);
        }
    };
})();
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
  Poly1305 ,
  PacketWriter
};