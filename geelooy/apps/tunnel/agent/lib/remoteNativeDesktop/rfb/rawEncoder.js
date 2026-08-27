// B"H
function toVncPixels(fb) {
  const out = Buffer.alloc(fb.width * fb.height * 4);
  for (let i = 0, j = 0; i < fb.pixels.length; i += 4, j += 4) {
    out[j] = fb.pixels[i + 2]; out[j + 1] = fb.pixels[i + 1]; out[j + 2] = fb.pixels[i]; out[j + 3] = 0;
  }
  return out;
}
function update(fb) {
  const header = Buffer.alloc(16);
  header[0] = 0; header[1] = 0; header.writeUInt16BE(1, 2);
  header.writeUInt16BE(0, 4); header.writeUInt16BE(0, 6); header.writeUInt16BE(fb.width, 8); header.writeUInt16BE(fb.height, 10); header.writeInt32BE(0, 12);
  return Buffer.concat([header, toVncPixels(fb)]);
}
module.exports = { toVncPixels, update };
