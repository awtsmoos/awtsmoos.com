// B"H
const { writeVarUint } = require('./VarInt.js');

/**
 * ByteWriter gathers exact sparks into a strict SANG vessel.
 * No padded air is added to strings or blobs; the Awtsmoos reveals only
 * the necessary bytes, then stops at the precise edge of meaning.
 */
class ByteWriter {
  constructor() { this.bytes = []; }
  u8(value) { this.bytes.push(value & 255); return this; }
  u16(value) { this.u8(value); this.u8(value >> 8); return this; }
  varUint(value) { writeVarUint(this.bytes, value); return this; }
  raw(values) { for (const value of values) this.u8(value); return this; }
  utf8(text) { return Buffer.from(String(text), 'utf8'); }
  string(text) {
    const buf = this.utf8(text);
    this.varUint(buf.length);
    this.raw(buf);
    return this;
  }
  bytesWithLength(values) {
    const buf = Buffer.from(values || []);
    this.varUint(buf.length);
    this.raw(buf);
    return this;
  }
  json(value) { return this.string(JSON.stringify(value)); }
  toBuffer() { return Buffer.from(this.bytes); }
}
module.exports = { ByteWriter };
