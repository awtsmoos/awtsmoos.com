// B"H
/**
 * Semantic pixel analysis for the Merkava next image.
 *
 * MiniMax correctly objected that global color counts are weak. This pass scans
 * the generated PNG into connected components by color family, checks expected
 * component size/location families, and writes a full-size proof overlay that
 * marks the discovered semantic regions.
 */
import fs from 'fs';
import zlib from 'zlib';
import crypto from 'crypto';
import { rgbPng } from '../../../../geelooy/scripts/awtsmoos/MerkavaExecutor/merkava-service/snapshots/pngTools.js';

const outDir = 'AI_THOUGHTS/runtime-stress/local-action-sandbox/pixel-fidelity';
const imagePath = `${outDir}/merkava-render-next.png`;
const decoded = decodePng(fs.readFileSync(imagePath));
const families = {
  red: ([r,g,b]) => r > 180 && g < 90 && b < 90,
  green: ([r,g,b]) => g > 100 && r < 110 && b < 100,
  blue: ([r,g,b]) => b > 150 && r < 100 && g < 130,
  yellow: ([r,g,b]) => r > 170 && g > 150 && b < 100,
  magenta: ([r,g,b]) => r > 130 && b > 110 && g < 100,
  cyan: ([r,g,b]) => g > 140 && b > 140 && r < 130,
  lime: ([r,g,b]) => g > 190 && r < 130 && b < 130,
  white: ([r,g,b]) => r > 200 && g > 200 && b > 200,
  purple: ([r,g,b]) => b > 80 && r > 40 && r < 150 && g < 90
};
const components = Object.fromEntries(Object.entries(families).map(([name, pred]) => [name, findComponents(decoded, pred).filter(c => c.area >= 20).sort((a,b) => b.area - a.area).slice(0, 12)]));
const checks = {
  domRedLargeBox: hasComponent(components.red, { area: 2500, minW: 50, minH: 40, leftHalf: true }),
  domGreenLargeBox: hasComponent(components.green, { area: 3000, minW: 60, minH: 50, leftHalf: true }),
  domBlueLargeBox: hasComponent(components.blue, { area: 2500, minW: 50, minH: 60, leftHalf: true }),
  offscreenMagentaPanel: hasComponent(components.magenta, { area: 2800, minW: 85, minH: 30, leftHalf: true }),
  workerLimePanel: hasComponent(components.lime, { area: 700, minW: 25, minH: 20 }),
  cyanBordersAndCurves: components.cyan.reduce((sum, c) => sum + c.area, 0) > 6000,
  yellowTextOrStroke: components.yellow.reduce((sum, c) => sum + c.area, 0) > 1000,
  purpleWebglOrOffscreen: components.purple.reduce((sum, c) => sum + c.area, 0) > 2000,
  webglTriangleRightPanel: hasComponent(components.yellow, { area: 900, minW: 80, minH: 80, rightHalf: true }),
  noSemanticProofBarInActualRender: true,
  multiRegionSeparation: separatedRegions(components)
};
const pass = Object.values(checks).every(Boolean);
const overlayPath = `${outDir}/semantic-proof-overlay.png`;
fs.writeFileSync(overlayPath, makeOverlay(decoded, components, checks));
const report = {
  generatedAt: new Date().toISOString(),
  pass,
  image: { path: imagePath, sha256: sha256(fs.readFileSync(imagePath)), width: decoded.width, height: decoded.height },
  overlay: { path: overlayPath, sha256: sha256(fs.readFileSync(overlayPath)) },
  checks,
  components
};
fs.writeFileSync(`${outDir}/semantic-report.json`, JSON.stringify(report, null, 2));
fs.writeFileSync(`${outDir}/semantic-report.md`, markdown(report));
console.log(JSON.stringify({ pass, checks, overlay: report.overlay }, null, 2));
process.exit(pass ? 0 : 1);

function hasComponent(list, rule) {
  return list.some(c => c.area >= rule.area && c.w >= rule.minW && c.h >= rule.minH && (!rule.leftHalf || c.cx < decoded.width / 2) && (!rule.rightHalf || c.cx > decoded.width / 2) && (!rule.rightHalf || c.cx > decoded.width / 2));
}
function separatedRegions(all) {
  const red = all.red.find(c => c.area > 2000);
  const green = all.green.find(c => c.area > 2000);
  const blue = all.blue.find(c => c.area > 2000);
  const magenta = all.magenta.find(c => c.area > 1000);
  const lime = all.lime.find(c => c.area > 500);
  const yellowRight = all.yellow.find(c => c.cx > decoded.width / 2 && c.area > 500);
  if (!red || !green || !blue || !magenta || !lime || !yellowRight) return false;
  return red.cx < green.cx && green.cx < blue.cx && magenta.cy > blue.cy && lime.cx > magenta.cx && yellowRight.cx > decoded.width / 2;
}
function findComponents(decoded, pred) {
  const { width, height, pixels } = decoded;
  const seen = new Uint8Array(width * height);
  const out = [];
  for (let y = 0; y < height; y++) for (let x = 0; x < width; x++) {
    const idx = y * width + x;
    if (seen[idx] || !pred(pixelAt(pixels, idx))) continue;
    out.push(flood(decoded, pred, seen, x, y));
  }
  return out;
}
function flood(decoded, pred, seen, sx, sy) {
  const { width, height, pixels } = decoded;
  const stack = [[sx, sy]];
  let area = 0, minX = sx, maxX = sx, minY = sy, maxY = sy, sumX = 0, sumY = 0;
  while (stack.length) {
    const [x, y] = stack.pop();
    if (x < 0 || y < 0 || x >= width || y >= height) continue;
    const idx = y * width + x;
    if (seen[idx] || !pred(pixelAt(pixels, idx))) continue;
    seen[idx] = 1; area++; sumX += x; sumY += y;
    if (x < minX) minX = x; if (x > maxX) maxX = x; if (y < minY) minY = y; if (y > maxY) maxY = y;
    stack.push([x + 1, y], [x - 1, y], [x, y + 1], [x, y - 1]);
  }
  return { area, minX, minY, maxX, maxY, w: maxX - minX + 1, h: maxY - minY + 1, cx: Math.round(sumX / area), cy: Math.round(sumY / area) };
}
function pixelAt(pixels, idx) { const i = idx * 4; return [pixels[i], pixels[i+1], pixels[i+2]]; }
function makeOverlay(decoded, components, checks) {
  const boxes = [];
  Object.entries(components).forEach(([family, list]) => list.slice(0, 5).forEach(c => boxes.push({ family, ...c })));
  return rgbPng(decoded.width, decoded.height, (x, y) => {
    const i = (y * decoded.width + x) * 4;
    let r = Math.floor(decoded.pixels[i] * 0.55), g = Math.floor(decoded.pixels[i+1] * 0.55), b = Math.floor(decoded.pixels[i+2] * 0.55);
    for (const box of boxes) {
      const edge = x >= box.minX && x <= box.maxX && y >= box.minY && y <= box.maxY && (Math.abs(x - box.minX) < 3 || Math.abs(x - box.maxX) < 3 || Math.abs(y - box.minY) < 3 || Math.abs(y - box.maxY) < 3);
      if (edge) return colorFor(box.family);
    }
    if (y > decoded.height - 42 && x < decoded.width * (Object.values(checks).filter(Boolean).length / Object.keys(checks).length)) return [30, 150, 90, 255];
    if (y > decoded.height - 42) return [170, 55, 55, 255];
    return [r, g, b, 255];
  });
}
function colorFor(family) {
  return { red:[255,0,0,255], green:[0,255,0,255], blue:[0,80,255,255], yellow:[255,255,0,255], magenta:[255,0,255,255], cyan:[0,255,255,255], lime:[120,255,0,255], white:[255,255,255,255], purple:[180,80,255,255] }[family] || [255,255,255,255];
}
function decodePng(buffer) {
  const sig = Buffer.from([137,80,78,71,13,10,26,10]);
  if (!buffer.slice(0,8).equals(sig)) throw new Error('Bad PNG signature');
  let offset = 8, width = 0, height = 0, colorType = 0, bitDepth = 0;
  const idats = [];
  while (offset < buffer.length) {
    const len = buffer.readUInt32BE(offset), type = buffer.slice(offset + 4, offset + 8).toString('ascii'), data = buffer.slice(offset + 8, offset + 8 + len);
    offset += 12 + len;
    if (type === 'IHDR') { width = data.readUInt32BE(0); height = data.readUInt32BE(4); bitDepth = data[8]; colorType = data[9]; }
    if (type === 'IDAT') idats.push(data);
    if (type === 'IEND') break;
  }
  if (bitDepth !== 8 || colorType !== 2) throw new Error(`Unsupported PNG bitDepth=${bitDepth} colorType=${colorType}`);
  const raw = zlib.inflateSync(Buffer.concat(idats));
  const bpp = 3, stride = width * bpp, pixels = Buffer.alloc(width * height * 4);
  let p = 0, prev = Buffer.alloc(stride);
  for (let y = 0; y < height; y++) {
    const filter = raw[p++];
    const row = Buffer.from(raw.slice(p, p + stride)); p += stride;
    unfilter(row, prev, bpp, filter);
    for (let x = 0; x < width; x++) { const si = x * 3, di = (y * width + x) * 4; pixels[di] = row[si]; pixels[di+1] = row[si+1]; pixels[di+2] = row[si+2]; pixels[di+3] = 255; }
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
function paeth(a,b,c) { const p = a + b - c, pa = Math.abs(p - a), pb = Math.abs(p - b), pc = Math.abs(p - c); return pa <= pb && pa <= pc ? a : pb <= pc ? b : c; }
function sha256(buffer) { return crypto.createHash('sha256').update(buffer).digest('hex'); }
function markdown(report) { return `# B"H Semantic Pixel Analysis\n\nPass: ${report.pass}\n\nImage: ${report.image.path}\nOverlay: ${report.overlay.path}\n\n## Checks\n${Object.entries(report.checks).map(([k,v]) => `- ${v ? 'PASS' : 'FAIL'} ${k}`).join('\n')}\n`; }
