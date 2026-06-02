// B"H
/**
 * Pixel fidelity first witness.
 *
 * The previous conformance wave proved command capture. This harness proves
 * visible pixels: it renders a deterministic scene through Merkava, decodes the
 * PNG, counts color families, writes an annotated proof image, and records exact
 * failures. It is not yet a Chrome-vs-Merkava diff, but it is the first hard
 * pixel gate: if OffscreenCanvas, Worker bitmap, ImageData, Path2D, drawImage,
 * and WebGL evidence are not visible as pixels, this fails.
 */
import fs from 'fs';
import zlib from 'zlib';
import crypto from 'crypto';
import { simulateRuntime } from '../../../../geelooy/scripts/awtsmoos/MerkavaExecutor/merkava-service/index.js';
import { rgbPng } from '../../../../geelooy/scripts/awtsmoos/MerkavaExecutor/merkava-service/snapshots/pngTools.js';

const outDir = 'AI_THOUGHTS/runtime-stress/local-action-sandbox/pixel-fidelity';
fs.mkdirSync(outDir, { recursive: true });

const html = `<!doctype html><html><head><style>
body{margin:0;background:#08090e;color:white;font-family:sans-serif}.wrap{padding:24px;display:grid;grid-template-columns:1fr 1fr;gap:16px}.panel{background:#1b1f2a;border:2px solid #4ad2f0;border-radius:18px;padding:16px}canvas{border:2px solid #4ad2f0;border-radius:10px;background:#063235}.caption{color:#ffcf5a;font-weight:bold}
</style></head><body><main class="wrap"><section class="panel"><h1>PIXEL TEST CANVAS</h1><p class="caption">Red green blue yellow magenta cyan lime must be visible.</p><canvas id="two" width="520" height="390"></canvas></section><section class="panel"><h2>WEBGL WITNESS</h2><p class="caption">The right canvas must show the virtual WebGL triangle, not an offscreen bitmap.</p><canvas id="gl" width="520" height="390"></canvas></section></main><script>
window.pixelState={};
const c=document.getElementById('two');
const ctx=c.getContext('2d');
ctx.fillStyle='rgb(8,48,50)'; ctx.fillRect(0,0,520,390);
ctx.fillStyle='red'; ctx.fillRect(20,20,96,80);
ctx.fillStyle='green'; ctx.fillRect(135,30,108,94);
ctx.fillStyle='blue'; ctx.fillRect(264,40,92,110);
ctx.fillStyle='yellow'; ctx.font='24px sans-serif'; ctx.fillText('DOM 2D COMMANDS',24,182);
const off=new OffscreenCanvas(220,130); const ox=off.getContext('2d');
const g=ox.createLinearGradient(0,0,220,0); g.addColorStop(0,'orange'); g.addColorStop(1,'magenta');
ox.fillStyle=g; ox.fillRect(0,0,220,130); ox.fillStyle='magenta'; ox.fillRect(20,22,180,72); ox.strokeStyle='cyan'; ox.lineWidth=5;
const p=new Path2D(); p.moveTo(10,110); p.bezierCurveTo(45,20,170,18,210,110); p.closePath(); ox.stroke(p); ox.clip(p); ox.fillStyle='rgba(90,0,110,.65)'; ox.fillRect(36,54,148,44); 
const imageData=ox.getImageData(0,0,8,8); ox.putImageData(imageData,10,10);
ctx.drawImage(off.transferToImageBitmap(),30,235,190,110);
ctx.fillStyle='yellow'; ctx.font='14px sans-serif'; ctx.fillText('OFFSCREEN',42,226);
const worker=new Worker('worker.js');
worker.onmessage=e=>{ctx.drawImage(e.data.bitmap,260,235,190,110);ctx.fillStyle='yellow';ctx.font='14px sans-serif';ctx.fillText('WORKER',286,226);window.pixelState.worker=e.data.ok;window.pixelState.commands=document.textureArena.snapshot().commands.length;};
worker.postMessage({});
const gl=document.getElementById('gl').getContext('webgl'); gl.canvas.width=520; gl.canvas.height=390; gl.clearColor(.24,.06,.62,1); gl.clear(gl.COLOR_BUFFER_BIT); gl.drawArrays(gl.TRIANGLES,0,3);
window.pixelState.ready=true;
</script></body></html>`;
const files = { 'index.html': html, 'worker.js': `onmessage=()=>{const c=new OffscreenCanvas(180,90);const x=c.getContext('2d');x.fillStyle='black';x.fillRect(0,0,180,90);x.fillStyle='lime';x.fillRect(12,12,72,54);x.fillStyle='cyan';x.fillRect(98,18,62,46);x.strokeStyle='white';x.lineWidth=4;const p=new Path2D();p.arc(92,45,32,0,6.283);x.stroke(p);postMessage({ok:true,bitmap:c.transferToImageBitmap()});};` };

const result = await simulateRuntime({ runtime:'MekravaExecutor', entry:'index.html', files, snapshot:true, format:'png', fullPage:true, values:['window.pixelState'], waitMs:240 });
const snapshot = result.snapshot || {};
const pngData = dataUrlToBuffer(snapshot.dataUrl || '');
if (!pngData.length) throw new Error('No PNG dataUrl returned from Merkava');
const renderPath = `${outDir}/merkava-render-next.png`;
fs.writeFileSync(renderPath, pngData);
const decoded = decodePng(pngData);
const colorStats = countColors(decoded);
const checks = {
  redPixels: colorStats.red > 1000,
  greenPixels: colorStats.green > 1000,
  bluePixels: colorStats.blue > 1000,
  yellowPixels: colorStats.yellow > 200,
  magentaPixels: colorStats.magenta > 500,
  cyanPixels: colorStats.cyan > 500,
  limePixels: colorStats.lime > 300,
  whitePixels: colorStats.white > 500,
  offscreenRecorded: (snapshot.canvas?.textures || []).some(t => t.width === 220 && t.height === 130),
  workerRecorded: (snapshot.canvas?.textures || []).some(t => t.width === 180 && t.height === 90),
  webglRecorded: (snapshot.canvas?.textures || []).some(t => t.kind === 'canvas-webgl'),
  webglDrawRecorded: (snapshot.canvas?.commands || []).some(c => c.op === 'webgl.drawArrays'),
  drawImageRecorded: (snapshot.canvas?.commands || []).some(c => c.op === 'drawImageTexture')
};
const pass = Object.values(checks).every(Boolean);
const proofPath = `${outDir}/color-proof-map.png`;
fs.writeFileSync(proofPath, makeProofMap(colorStats, checks));
const report = {
  generatedAt:new Date().toISOString(),
  pass,
  ok:result.ok,
  image:{ path:renderPath, bytes:pngData.length, sha256:sha256(pngData), width:decoded.width, height:decoded.height },
  proof:{ path:proofPath },
  values:result.values,
  checks,
  colorStats,
  textures:(snapshot.canvas?.textures || []).map(t => ({ id:t.id, kind:t.kind, width:t.width, height:t.height, ops:(t.commands || []).map(c => c.op) })),
  commandOps:(snapshot.canvas?.commands || []).map(c => c.op)
};
fs.writeFileSync(`${outDir}/report.json`, JSON.stringify(report, null, 2));
fs.writeFileSync(`${outDir}/report.md`, markdown(report));
console.log(JSON.stringify({ pass, image:report.image, checks, colorStats }, null, 2));
process.exit(pass ? 0 : 1);

function dataUrlToBuffer(url) { const base64 = String(url || '').replace(/^data:image\/png;base64,/, ''); return base64 ? Buffer.from(base64, 'base64') : Buffer.alloc(0); }
function sha256(buffer) { return crypto.createHash('sha256').update(buffer).digest('hex'); }
function decodePng(buffer) {
  const sig = Buffer.from([137,80,78,71,13,10,26,10]);
  if (!buffer.slice(0,8).equals(sig)) throw new Error('Bad PNG signature');
  let offset = 8, width = 0, height = 0, colorType = 0, bitDepth = 0;
  const idats = [];
  while (offset < buffer.length) {
    const len = buffer.readUInt32BE(offset); const type = buffer.slice(offset + 4, offset + 8).toString('ascii'); const data = buffer.slice(offset + 8, offset + 8 + len); offset += 12 + len;
    if (type === 'IHDR') { width = data.readUInt32BE(0); height = data.readUInt32BE(4); bitDepth = data[8]; colorType = data[9]; }
    if (type === 'IDAT') idats.push(data);
    if (type === 'IEND') break;
  }
  if (bitDepth !== 8 || colorType !== 2) throw new Error(`Unsupported PNG type bitDepth=${bitDepth} colorType=${colorType}`);
  const raw = zlib.inflateSync(Buffer.concat(idats));
  const bpp = 3, stride = width * bpp;
  const pixels = Buffer.alloc(width * height * 4);
  let rawOffset = 0;
  let prev = Buffer.alloc(stride);
  for (let y = 0; y < height; y++) {
    const filter = raw[rawOffset++];
    const row = Buffer.from(raw.slice(rawOffset, rawOffset + stride)); rawOffset += stride;
    unfilter(row, prev, bpp, filter);
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
    const left = i >= bpp ? row[i - bpp] : 0;
    const up = prev[i] || 0;
    const upLeft = i >= bpp ? prev[i - bpp] || 0 : 0;
    if (filter === 1) row[i] = (row[i] + left) & 255;
    else if (filter === 2) row[i] = (row[i] + up) & 255;
    else if (filter === 3) row[i] = (row[i] + Math.floor((left + up) / 2)) & 255;
    else if (filter === 4) row[i] = (row[i] + paeth(left, up, upLeft)) & 255;
  }
}
function paeth(a,b,c){ const p=a+b-c, pa=Math.abs(p-a), pb=Math.abs(p-b), pc=Math.abs(p-c); return pa<=pb && pa<=pc ? a : pb<=pc ? b : c; }
function countColors(decoded) {
  const stats = { red:0, green:0, blue:0, yellow:0, magenta:0, cyan:0, lime:0, white:0, dark:0, total:decoded.width * decoded.height };
  for (let i = 0; i < decoded.pixels.length; i += 4) {
    const r = decoded.pixels[i], g = decoded.pixels[i+1], b = decoded.pixels[i+2];
    if (r > 180 && g < 80 && b < 80) stats.red++;
    if (g > 100 && r < 90 && b < 90) stats.green++;
    if (b > 150 && r < 90 && g < 120) stats.blue++;
    if (r > 170 && g > 150 && b < 90) stats.yellow++;
    if (r > 130 && b > 110 && g < 80) stats.magenta++;
    if (g > 140 && b > 140 && r < 110) stats.cyan++;
    if (g > 180 && r < 120 && b < 120) stats.lime++;
    if (r > 200 && g > 200 && b > 200) stats.white++;
    if (r < 20 && g < 25 && b < 35) stats.dark++;
  }
  return stats;
}
function makeProofMap(stats, checks) {
  const rows = Object.entries(checks);
  const width = 720, height = 40 + rows.length * 34;
  return rgbPng(width, height, (x, y) => {
    if (x < 0 || y < 0) return [0,0,0,255];
    if (y < 34) return [26,28,38,255];
    const row = Math.floor((y - 40) / 34);
    const [, ok] = rows[row] || [];
    if (row >= 0 && row < rows.length && x > 20 && x < 700 && (y - 40) % 34 < 24) return ok ? [30,150,90,255] : [180,50,50,255];
    return [8,9,14,255];
  });
}
function markdown(report) {
  return `# B"H Pixel Test First Witness\n\nPass: ${report.pass}\n\nImage: ${report.image.path}\nProof map: ${report.proof.path}\nSHA256: ${report.image.sha256}\n\n## Checks\n${Object.entries(report.checks).map(([k,v]) => `- ${v ? 'PASS' : 'FAIL'} ${k}`).join('\n')}\n\n## Color stats\n\n\`\`\`json\n${JSON.stringify(report.colorStats, null, 2)}\n\`\`\`\n`;
}
