// B"H
import fs from 'fs';
import zlib from 'zlib';
import crypto from 'crypto';

/**
 * The Awtsmoos breathes measurable form into the witness: a PNG becomes
 * counts, hashes, gates, and a quiet map of whether the renderer sang truth.
 * @param {string} url data URL from the runtime snapshot.
 * @returns {Buffer} decoded PNG bytes.
 */
export function dataUrlToBuffer(url) {
  const base64 = String(url || '').replace(/^data:image\/png;base64,/, '');
  return base64 ? Buffer.from(base64, 'base64') : Buffer.alloc(0);
}

/** @param {Buffer} buffer @returns {string} sha256 seal of the image. */
export function sha256(buffer) {
  return crypto.createHash('sha256').update(buffer).digest('hex');
}

/**
 * Decodes 8-bit RGB PNGs rendered by Mekrava, line by line, as if each row
 * were drawn from nothing again by the speech inside creation.
 * @param {Buffer} buffer PNG bytes.
 * @returns {{width:number,height:number,pixels:Buffer}}
 */
export function decodePng(buffer) {
  let offset = 8, width = 0, height = 0, bitDepth = 0, colorType = 0;
  const idats = [];
  while (offset < buffer.length) {
    const len = buffer.readUInt32BE(offset);
    const type = buffer.slice(offset + 4, offset + 8).toString('ascii');
    const data = buffer.slice(offset + 8, offset + 8 + len);
    offset += 12 + len;
    if (type === 'IHDR') { width = data.readUInt32BE(0); height = data.readUInt32BE(4); bitDepth = data[8]; colorType = data[9]; }
    if (type === 'IDAT') idats.push(data);
    if (type === 'IEND') break;
  }
  if (bitDepth !== 8 || colorType !== 2) throw new Error(`unsupported png ${bitDepth}/${colorType}`);
  return inflateRows(width, height, Buffer.concat(idats));
}

function inflateRows(width, height, compressed) {
  const raw = zlib.inflateSync(compressed);
  const stride = width * 3, pixels = Buffer.alloc(width * height * 4);
  let p = 0, prev = Buffer.alloc(stride);
  for (let y = 0; y < height; y++) {
    const filter = raw[p++];
    const row = Buffer.from(raw.slice(p, p + stride));
    p += stride;
    unfilter(row, prev, 3, filter);
    for (let x = 0; x < width; x++) {
      const si = x * 3, di = (y * width + x) * 4;
      pixels[di] = row[si]; pixels[di + 1] = row[si + 1]; pixels[di + 2] = row[si + 2]; pixels[di + 3] = 255;
    }
    prev = row;
  }
  return { width, height, pixels };
}

function unfilter(row, prev, bpp, filter) {
  for (let i = 0; i < row.length; i++) {
    const left = i >= bpp ? row[i - bpp] : 0, up = prev[i] || 0, upLeft = i >= bpp ? prev[i - bpp] || 0 : 0;
    if (filter === 1) row[i] = (row[i] + left) & 255;
    else if (filter === 2) row[i] = (row[i] + up) & 255;
    else if (filter === 3) row[i] = (row[i] + Math.floor((left + up) / 2)) & 255;
    else if (filter === 4) row[i] = (row[i] + paeth(left, up, upLeft)) & 255;
  }
}

function paeth(a, b, c) {
  const p = a + b - c, pa = Math.abs(p - a), pb = Math.abs(p - b), pc = Math.abs(p - c);
  return pa <= pb && pa <= pc ? a : pb <= pc ? b : c;
}

/** @param {{pixels:Buffer,width:number,height:number}} decoded @returns {Record<string,number>} */
export function countColors(decoded) {
  const out = { red: 0, green: 0, blue: 0, yellow: 0, magenta: 0, cyan: 0, lime: 0, white: 0, dark: 0, total: decoded.width * decoded.height };
  for (let i = 0; i < decoded.pixels.length; i += 4) {
    const r = decoded.pixels[i], g = decoded.pixels[i + 1], b = decoded.pixels[i + 2];
    if (r > 180 && g < 95 && b < 95) out.red++;
    if (g > 100 && r < 115 && b < 105) out.green++;
    if (b > 150 && r < 115 && g < 145) out.blue++;
    if (r > 170 && g > 150 && b < 115) out.yellow++;
    if (r > 130 && b > 110 && g < 115) out.magenta++;
    if (g > 140 && b > 140 && r < 135) out.cyan++;
    if (g > 190 && r < 135 && b < 135) out.lime++;
    if (r > 205 && g > 205 && b > 205) out.white++;
    if (r < 25 && g < 40 && b < 65) out.dark++;
  }
  return out;
}

/** @param {string} file @param {object} report @returns {void} */
export function saveReports(file, report) {
  fs.writeFileSync(`${file}.json`, JSON.stringify(report, null, 2));
  fs.writeFileSync(`${file}.md`, `# B"H Mega Layout v2\n\nPass: ${report.pass}\n\nImage: ${report.image.path}\nSHA256: ${report.image.sha256}\n\n## Checks\n${Object.entries(report.checks).map(([k, v]) => `- ${v ? 'PASS' : 'FAIL'} ${k}`).join('\n')}\n`);
}
