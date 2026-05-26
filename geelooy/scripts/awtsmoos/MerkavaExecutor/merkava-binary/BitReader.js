// B"H
/**
 * BitReader opens bit-packed values exactly where the previous value ended.
 */
class BitReader {
  constructor(buffer) { this.buffer = Buffer.from(buffer || []); this.offset = 0; this.bit = 0; }
  bits(count) {
    let value = 0;
    for (let i = 0; i < count; i++) {
      const byte = this.buffer[this.offset] || 0;
      value |= ((byte >> this.bit) & 1) << i;
      this.bit++;
      if (this.bit === 8) { this.bit = 0; this.offset++; }
    }
    return value >>> 0;
  }
  done() { return this.offset >= this.buffer.length; }
}
module.exports = { BitReader };
