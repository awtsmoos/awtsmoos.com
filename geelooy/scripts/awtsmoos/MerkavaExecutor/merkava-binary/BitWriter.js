// B"H
/**
 * BitWriter lets the binary breathe below byte boundaries.
 * Tiny values can occupy 1, 2, 3, or 6 bits, and the next meaning starts
 * immediately in the remaining sparks of the same byte.
 */
class BitWriter {
  constructor() { this.bytes = []; this.current = 0; this.bit = 0; }
  bits(value, count) {
    let v = value >>> 0;
    for (let i = 0; i < count; i++) {
      this.current |= ((v >> i) & 1) << this.bit;
      this.bit++;
      if (this.bit === 8) this.flushByte();
    }
    return this;
  }
  flushByte() { this.bytes.push(this.current & 255); this.current = 0; this.bit = 0; return this; }
  finish() { if (this.bit) this.flushByte(); return Buffer.from(this.bytes); }
}
module.exports = { BitWriter };
