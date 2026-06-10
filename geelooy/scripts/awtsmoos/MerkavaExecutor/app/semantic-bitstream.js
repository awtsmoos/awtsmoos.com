// B"H
(function semanticBitstream(root) {
  const awt = root.AwtsSemantic = root.AwtsSemantic || {};

  /**
   * B"H. A bit-writer where the Awtsmoos lets one meaning begin inside the
   * unfinished byte of another; no logical padding is ever counted as source.
   */
  class BitWriter {
    constructor() { this.bytes = []; this.bitLength = 0; }
    bit(value) {
      const slot = this.bitLength >> 3;
      const shift = 7 - (this.bitLength & 7);
      this.bytes[slot] = this.bytes[slot] || 0;
      this.bytes[slot] |= (value & 1) << shift;
      this.bitLength += 1;
    }
    write(value, width) {
      for (let index = width - 1; index >= 0; index -= 1) this.bit((value >> index) & 1);
    }
    width(size) { return Math.max(1, Math.ceil(Math.log2(Math.max(2, size)))); }
    enum(value, size) { this.write(value, this.width(size)); }
    varTiny(value) {
      if (value < 16) { this.write(0, 1); this.write(value, 4); return; }
      this.write(1, 1); this.write(value, 12);
    }
  }

  /**
   * B"H. A bit-reader that follows the declared bit length, never the physical
   * byte padding of the final container.
   */
  class BitReader {
    constructor(bytes, bitLength) { this.bytes = bytes; this.bitLength = bitLength; this.ip = 0; }
    bit() {
      if (this.ip >= this.bitLength) throw new Error("Semantic bitstream exhausted");
      const byte = this.bytes[this.ip >> 3] || 0;
      const bit = (byte >> (7 - (this.ip & 7))) & 1;
      this.ip += 1;
      return bit;
    }
    read(width) {
      let out = 0;
      for (let index = 0; index < width; index += 1) out = (out << 1) | this.bit();
      return out >>> 0;
    }
    width(size) { return Math.max(1, Math.ceil(Math.log2(Math.max(2, size)))); }
    enum(size) { return this.read(this.width(size)); }
    varTiny() { return this.read(1) ? this.read(12) : this.read(4); }
  }

  awt.BitWriter = BitWriter;
  awt.BitReader = BitReader;
})(window);
