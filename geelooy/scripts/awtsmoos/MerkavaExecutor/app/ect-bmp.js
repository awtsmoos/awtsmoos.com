// B"H
(function ectBmp(root) {
  const ect = root.AwtsECT = root.AwtsECT || {};

  /**
   * B"H. Paints the project bytecode as a valid 24-bit BMP vessel.
   * @param {{bytes:number[],bitLength:number}} code Storage code.
   */
  function toBmp(code) {
    const payload = u32(code.bitLength).concat(code.bytes);
    const pixels = Math.ceil(payload.length / 3);
    const width = Math.ceil(Math.sqrt(pixels));
    const height = Math.ceil(pixels / width);
    const row = width * 3;
    const padded = Math.ceil(row / 4) * 4;
    const size = 54 + padded * height;
    const out = new Uint8Array(size);
    out.set([66, 77].concat(u32(size), [0, 0, 0, 0], u32(54)), 0);
    out.set(u32(40).concat(u32(width), u32(height), u16(1), u16(24), u32(0)), 14);
    out.set(u32(padded * height).concat(u32(2835), u32(2835), u32(0), u32(0)), 34);
    payload.forEach((byte, index) => { out[54 + Math.floor(index / row) * padded + (index % row)] = byte; });
    return { dataUrl: `data:image/bmp;base64,${b64(out)}`, width, height, bmpBytes: size };
  }

  function u32(n) { return [n & 255, (n >> 8) & 255, (n >> 16) & 255, (n >> 24) & 255]; }
  function u16(n) { return [n & 255, (n >> 8) & 255]; }
  function b64(bytes) { let s = ""; bytes.forEach(byte => { s += String.fromCharCode(byte); }); return btoa(s); }

  ect.toBmp = toBmp;
})(window);
