// B"H
const { readVarUint } = require('./VarInt.js');

/**
 * ByteReader opens exact SANG letters without padded expectation.
 * It reads length as varints, then consumes only the bytes that truly exist,
 * because the Awtsmoos gives form without waste.
 */
class ByteReader {
  constructor(buffer) { this.buffer = Buffer.from(buffer); this.offset = 0; }
  u8() { return this.buffer[this.offset++]; }
  u16() { const v = this.u8() | (this.u8() << 8); return v; }
  varUint() { return readVarUint(this); }
  bytes(length) {
    const end = this.offset + length;
    const slice = this.buffer.slice(this.offset, end);
    this.offset = end;
    return slice;
  }
  bytesWithLength() { return this.bytes(this.varUint()); }
  string() { return this.bytesWithLength().toString('utf8'); }
  json() { return JSON.parse(this.string()); }
  done() { return this.offset >= this.buffer.length; }
}
module.exports = { ByteReader };
