// B"H
(function ectBit(root) {
  const ect = root.AwtsECT = root.AwtsECT || {};

  /**
   * B"H. Sub-byte writer for the project scroll. The final byte may wear unused
   * padding, but the declared bitLength is the only counted revelation.
   */
  class Writer {
    constructor() { this.bytes = []; this.bitLength = 0; }
    bit(value) {
      const slot = this.bitLength >> 3;
      const shift = 7 - (this.bitLength & 7);
      this.bytes[slot] = this.bytes[slot] || 0;
      this.bytes[slot] |= (value & 1) << shift;
      this.bitLength += 1;
    }
    write(value, width) {
      for (let i = width - 1; i >= 0; i -= 1) this.bit((value >> i) & 1);
    }
    width(count) { return Math.max(1, Math.ceil(Math.log2(Math.max(2, count)))); }
    enum(value, count) { this.write(value, this.width(count)); }
    tiny(value) {
      if (value < 16) { this.write(0, 1); this.write(value, 4); return; }
      if (value < 4096) { this.write(2, 2); this.write(value, 12); return; }
      this.write(3, 2); this.write(value >>> 0, 24);
    }
  }

  function byteLength(bits) { return Math.ceil(bits / 8); }
  function utf8Length(text) { return new TextEncoder().encode(String(text || "")).length; }

  ect.Writer = Writer;
  ect.byteLength = byteLength;
  ect.utf8Length = utf8Length;
})(window);
