// B"H
// Yesod-Utilities.js: Foundation - Low-Level Tools

'use strict';
// A protocol-correct NullCipher that handles proper SSH packet framing.
class NullCipher {
  constructor(onWrite) {
    this._onWrite = onWrite;
    this.outSeqno = 0n;
  }
  encrypt(payload) {
    const payloadLen = payload.length;
    const block_size = 8;
    
    // The length of the packet *before* padding is added.
    // This includes the 4-byte packet_length, 1-byte pad_length, and payload.
    const unpaddedPacketLen = 4 + 1 + payloadLen;

    // The padding MUST be at least 4 bytes. The total packet size must be a
    // multiple of the block size (8 or 16, depending on the cipher). It is 8
    // for the null cipher.
    let padLen = block_size - (unpaddedPacketLen % block_size);
    if (padLen < 4) {
      padLen += block_size;
    }

    // This is the length that goes in the initial 4-byte length field.
    // It is the length of everything *except* that field.
    const packet_length_field = 1 + payloadLen + padLen;
    const total_wire_length = 4 + packet_length_field;

    const packet = Buffer.allocUnsafe(total_wire_length);

    // 1. [uint32 packet_length]
    packet.writeUInt32BE(packet_length_field, 0);
    // 2. [byte padding_length]
    packet[4] = padLen;
    // 3. [byte[n1] payload]
    payload.copy(packet, 5);
    // 4. [byte[n2] random padding]
    // For NullCipher, padding with zeros is acceptable.
    packet.fill(0, 5 + payloadLen);
    
    this._onWrite(packet);
    this.outSeqno++;
  }
}

class NullDecipher {
  constructor(onPayload) {
    this._onPayload = onPayload;
    this.inSeqno = 0n;
    this._len = 0; this._lenBytes = 0;
    this._packet = null; this._packetPos = 0;
  }
  decrypt(chunk, p, dataLen) {
    while (p < dataLen) {
      if (this._lenBytes < 4) {
        let nb = Math.min(4 - this._lenBytes, dataLen - p);
        this._lenBytes += nb;
        while (nb--) this._len = (this._len << 8) + chunk[p++];
        if (this._lenBytes < 4) return p;
        if (this._len < 5 || this._len > 35000) throw new Error('Bad packet length');
      }
      const needed = this._len;
      if (!this._packet) this._packet = Buffer.allocUnsafe(needed);
      const nb = Math.min(needed - this._packetPos, dataLen - p);
      chunk.copy(this._packet, this._packetPos, p, p + nb);
      p += nb; this._packetPos += nb;
      if (this._packetPos < needed) return p;
      const fullPacketBody = this._packet;
      const padLen = fullPacketBody[0];
      const payload = fullPacketBody.slice(1, needed - padLen);
      this._len = 0; this._lenBytes = 0;
      this._packet = null; this._packetPos = 0;
      this._onPayload(payload);
      this.inSeqno++;
    }
    return p;
  }
}

const Poly1305 = (() => {
    // The modulus: 2^130 - 5
    const P = BigInt('0x3fffffffffffffffffffffffffffffffb');

    // Reads a buffer of any length in Little-Endian (LE) to a BigInt
    const leToBigInt = (buf) => {
        let n = BigInt(0);
        for (let i = 0; i < buf.length; i++) {
            n += BigInt(buf[i]) << (BigInt(i) * BigInt(8));
        }
        return n;
    };

    // Writes the 128 least-significant bits of a BigInt to a 16-byte buffer in Little-Endian (LE)
    const bigIntToLe = (n) => {
        const buf = Buffer.alloc(16);
        for (let i = 0; i < 16; i++) {
            // Apply the mask 0xFF to get the lowest 8 bits
            buf[i] = Number(n & BigInt(0xFF));
            n >>= BigInt(8);
        }
        return buf;
    };

    return {
        /**
         * Computes the Poly1305 tag for a given key and message, per RFC 8439.
         * @param {Buffer} key - The 32-byte (256-bit) key.
         * @param {Buffer} data - The message data of any length.
         * @returns {Buffer} The 16-byte (128-bit) authentication tag.
         */
        tag: (key, data) => {
            // 1. Prepare R and S keys
            const r_buf = key.slice(0, 16);
            const s_buf = key.slice(16, 32);

            // Apply R key clamping as per RFC 8439
            r_buf[3] &= 0x0F;
            r_buf[7] &= 0x0F;
            r_buf[11] &= 0x0F;
            r_buf[15] &= 0x0F;
            r_buf[4] &= 0xFC;
            r_buf[8] &= 0xFC;
            r_buf[12] &= 0xFC;

            const r = leToBigInt(r_buf);
            const s = leToBigInt(s_buf);

            // 2. Main Poly1305 Accumulation Loop
            let a = BigInt(0);
            const block_size = 16;

            for (let i = 0; i < data.length; i += block_size) {
                const block = data.slice(i, i + block_size);
                
                // Create a 17-byte buffer for the message block
                const n_buf = Buffer.alloc(17, 0);
                block.copy(n_buf);
                
                // Set the capping bit (append a 1 after the data)
                n_buf[block.length] = 1;

                const n = leToBigInt(n_buf);
                
                // Accumulator update: a = ((a + n) * r) % P
                a += n;
                a = (r * a) % P;
            }

            // 3. Finalization: add s and serialize the lower 128 bits
            const final_tag_n = a + s;
            
            return bigIntToLe(final_tag_n);
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

  readByte() {
    if (this.pos >= this.buffer.length) return;
    return this.buffer[this.pos++];
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

// Basic uncompressed packet I/O helpers for code paths that need the shared shape.
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
NullCipher,
  NullDecipher,
  readUInt32BE,
  writeUInt32BE,
  BufferReader,
  ZlibPacketReader,
  ZlibPacketWriter,
  PacketReader,
  Poly1305,
  PacketWriter
};
