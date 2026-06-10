// B"H
(function compilerBitWriter(root) {
  const ns = root.AwtsEctCompilerParts = root.AwtsEctCompilerParts || {};

  /**
   * B"H. BitWriter: a small loom where unrelated fields may share a byte. The
   * stream does not bow to byte boundaries unless a format marker requires it.
   */
  class BitWriter {
    constructor() { this.bytes = []; this.bitLength = 0; }
    bit(value) {
      const index = this.bitLength >> 3;
      const shift = 7 - (this.bitLength & 7);
      this.bytes[index] = this.bytes[index] || 0;
      this.bytes[index] |= (value & 1) << shift;
      this.bitLength += 1;
    }
    write(value, width) { for (let bit = width - 1; bit >= 0; bit -= 1) this.bit((value >> bit) & 1); }
    width(count) { return Math.max(1, Math.ceil(Math.log2(Math.max(2, count)))); }
    enum(value, count) { this.write(value, this.width(count)); }
    tiny(value) {
      if (value < 8) { this.write(0, 1); this.write(value, 3); return; }
      if (value < 64) { this.write(2, 2); this.write(value, 6); return; }
      this.write(3, 2); this.write(value, 14);
    }
    text(value) { ns.writeClusterText(this, String(value || "")); }
  }

  ns.BitWriter = BitWriter;
})(typeof self !== "undefined" ? self : globalThis);
