// B"H
(function bmpVessels(root) {
  const forge = root.MerkavaForge = root.MerkavaForge || {};

  /** @param {number} n Number. @returns {number[]} Four little-endian bytes. */
  function u32(n) {
    return [n & 255, (n >> 8) & 255, (n >> 16) & 255, (n >> 24) & 255];
  }

  /** @param {number} n Number. @returns {number[]} Two little-endian bytes. */
  function u16(n) {
    return [n & 255, (n >> 8) & 255];
  }

  /**
   * Chapter Two: bytes become pixels. The Awtsmoos hides speech inside color,
   * blue-green-red rows with padded silence, then reveals it again intact.
   * @param {number[]} bytes Payload bytes.
   * @returns {{dataUrl:string,width:number,height:number,bmpBytes:number,pixels:number}} BMP vessel.
   */
  function bytesToBmp(bytes) {
    const payload = u32(bytes.length).concat(bytes);
    const pixels = Math.ceil(payload.length / 3);
    const width = Math.max(1, Math.ceil(Math.sqrt(pixels)));
    const height = Math.max(1, Math.ceil(pixels / width));
    const rowBytes = width * 3;
    const paddedRowBytes = Math.ceil(rowBytes / 4) * 4;
    const pixelOffset = 54;
    const fileSize = pixelOffset + paddedRowBytes * height;
    const out = new Uint8Array(fileSize);

    out.set([66, 77].concat(u32(fileSize), [0, 0, 0, 0], u32(pixelOffset)), 0);
    out.set(u32(40).concat(u32(width), u32(height), u16(1), u16(24), u32(0)), 14);
    out.set(u32(paddedRowBytes * height).concat(u32(2835), u32(2835), u32(0), u32(0)), 34);

    for (let i = 0; i < width * height * 3; i += 1) {
      const row = Math.floor(i / rowBytes);
      const col = i % rowBytes;
      out[pixelOffset + row * paddedRowBytes + col] = payload[i] || 0;
    }
    return { dataUrl: `data:image/bmp;base64,${binaryToBase64(out)}`, width, height, bmpBytes: fileSize, pixels };
  }

  /** @param {string} dataUrl BMP data URL. @returns {number[]} Original payload bytes. */
  function bmpToBytes(dataUrl) {
    const raw = base64ToBytes(String(dataUrl).split(",").pop() || "");
    const offset = readU32(raw, 10);
    const width = readU32(raw, 18);
    const height = readU32(raw, 22);
    const paddedRowBytes = Math.ceil(width * 3 / 4) * 4;
    const payload = [];
    for (let row = 0; row < height; row += 1) {
      for (let col = 0; col < width * 3; col += 1) payload.push(raw[offset + row * paddedRowBytes + col]);
    }
    const length = readU32(payload, 0);
    return payload.slice(4, 4 + length);
  }

  /** @param {Uint8Array} bytes Bytes. @returns {string} Base64 text. */
  function binaryToBase64(bytes) {
    let text = "";
    bytes.forEach(byte => { text += String.fromCharCode(byte); });
    return btoa(text);
  }

  /** @param {string} b64 Base64 text. @returns {number[]} Bytes. */
  function base64ToBytes(b64) {
    return Array.from(atob(b64), char => char.charCodeAt(0));
  }

  /** @param {ArrayLike<number>} bytes Bytes. @param {number} offset Offset. */
  function readU32(bytes, offset) {
    return (bytes[offset] || 0) | ((bytes[offset + 1] || 0) << 8) | ((bytes[offset + 2] || 0) << 16) | ((bytes[offset + 3] || 0) << 24);
  }

  forge.bytesToBmp = bytesToBmp;
  forge.bmpToBytes = bmpToBytes;
})(window);
