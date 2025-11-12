// B"H
// Yesod-Utilities.js: Foundation - Low-Level Tools

'use strict';
const Poly1305 = (() => {
    // The modulus: 2^130 - 5
    const P = BigInt('0x3fffffffffffffffffffffffffffffffb');

    // Reads 16 bytes (or less) in Little-Endian (LE) to a BigInt
    const leToBigInt = (buf) => {
        let n = BigInt(0);
        for (let i = 0; i < buf.length; i++) {
            n += BigInt(buf[i]) << (BigInt(i) * BigInt(8));
        }
        return n;
    };

    // Writes a BigInt to 16 bytes in Little-Endian (LE)
    const bigIntToLe = (n, len) => {
        const buf = Buffer.alloc(len);
        for (let i = 0; i < len; i++) {
            // Apply the mask 0xFF to get the lowest 8 bits
            buf[i] = Number(n & BigInt(0xFF));
            n >>= BigInt(8);
        }
        return buf;
    };

    return {
        tag: (key, data) => {
            // 1. Prepare R and S keys (R=first 16, S=last 16)
            const r_buf = key.slice(0, 16);
            const s_buf = key.slice(16, 32);

            // Apply R key clamping (r[3], r[7], r[11], r[15] &= 15; r[4], r[8], r[12] &= 252)
            r_buf[3] &= 0x0F; r_buf[7] &= 0x0F; r_buf[11] &= 0x0F; r_buf[15] &= 0x0F;
            r_buf[4] &= 0xFC; r_buf[8] &= 0xFC; r_buf[12] &= 0xFC;

            const r = leToBigInt(r_buf);
            const s = leToBigInt(s_buf);

            // 2. Main Poly1305 Accumulation Loop
            let a = BigInt(0);
            const block_size = 16;

            for (let i = 0; i < data.length; i += block_size) {
                const block = data.slice(i, i + block_size);
                
                // Poly1305 Message Block Construction (m_i + 2^128 capping)
                const n_buf = Buffer.alloc(17, 0); // Need 17 bytes for the BigInt conversion
                block.copy(n_buf, 0);
                
                // Set the Poly1305 capping byte: 0x01 on the byte after the last data byte
                n_buf[block.length] = 1; 

                const n = leToBigInt(n_buf);
                
                a += n;
                a = (r * a) % P;
            }

            // 3. Finalization: (a + s) mod 2^128 (no modulus P in this final step)
            // The addition of s is done modulo 2^128.
            const final_tag_n = (a + s) % (BigInt(1) << BigInt(128));
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
  Poly1305,
  PacketWriter
};