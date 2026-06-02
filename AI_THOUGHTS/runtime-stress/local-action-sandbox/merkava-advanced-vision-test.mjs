// B"H
/**
 * Advanced visible Merkava vision harness.
 *
 * The old scene only drew direct DOM canvas commands, so screenshots looked the
 * same after OffscreenCanvas/Worker work. This scene must visibly prove:
 * - DOM Canvas2D
 * - OffscreenCanvas rendered through drawImage(ImageBitmap)
 * - Worker-created OffscreenCanvas rendered through drawImage(ImageBitmap)
 * - Path2D curves/clip
 * - ImageData marker
 * - Canvas gradients/state
 * - WebGL command evidence
 */
import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { fileURLToPath } from 'url';
import { simulateRuntime } from '../../../geelooy/scripts/awtsmoos/MerkavaExecutor/merkava-service/index.js';

const here = path.dirname(fileURLToPath(import.meta.url));
const repo = path.resolve(here, '../../..');
const outDir = path.join(repo, 'AI_THOUGHTS/runtime-stress/local-action-sandbox/merkava-advanced-vision');
fs.mkdirSync(outDir, { recursive: true });

function rel(p) { return path.relative(repo, p).replace(/\\/g, '/'); }
function safe(value) { return JSON.parse(JSON.stringify(value, (k, v) => k === 'dataUrl' || k === 'pngDataUrl' ? '[omitted-data-url]' : v)); }
function writeJson(name, value) { fs.writeFileSync(path.join(outDir, name), JSON.stringify(safe(value), null, 2)); }
function writeText(name, value) { fs.writeFileSync(path.join(outDir, name), String(value || '')); }
function sha256(file) { return crypto.createHash('sha256').update(fs.readFileSync(file)).digest('hex'); }

const html = `<!doctype html>
<html><head><title>Merkava Full Canvas Vision</title><style>body{margin:0;background:#090b12;color:#f6f6fa;font-family:system-ui,sans-serif}.shell{padding:28px;display:grid;grid-template-columns:1fr 1fr;gap:18px}.card{background:linear-gradient(135deg,#202333,#141721);border:2px solid #58627f;border-radius:22px;padding:18px}.glow{border-color:#4ad2f0}.hero{font-size:28px;font-weight:800}.warn{color:#ffcf5a}.pill{display:inline-block;background:#586fff;color:white;padding:10px 18px;border-radius:999px}.nested{margin-top:16px;background:#0f1320;border-radius:16px;padding:16px}canvas{border:2px solid #4ad2f0;border-radius:12px}</style></head>
<body>
<main class="shell">
  <section class="card glow">
    <h1 class="hero">B'H Merkava Canvas Engine</h1>
    <p class="warn">DOM canvas below includes OffscreenCanvas, Worker bitmap, Path2D, ImageData, gradients, and text metrics.</p>
    <span class="pill">Worker + Offscreen + 2D</span>
    <div class="nested">
      <strong>Composite vessel</strong>
      <p>Left: direct 2D. Middle: Offscreen drawImage. Right: Worker bitmap.</p>
      <canvas id="two" width="420" height="260"></canvas>
    </div>
  </section>
  <section class="card">
    <h2>WebGL + Offscreen Vessel</h2>
    <p>Virtual WebGL records clearColor and draw calls; worker/offscreen data is in snapshot metadata.</p>
    <canvas id="gl" width="420" height="260"></canvas>
  </section>
</main>
<script>
window.appState={ready:false};
const c=document.getElementById('two');
const ctx=c.getContext('2d');
ctx.fillStyle='rgb(16,46,50)'; ctx.fillRect(0,0,420,260);
ctx.fillStyle='red'; ctx.fillRect(18,24,78,54);
ctx.fillStyle='green'; ctx.fillRect(116,34,82,70);
ctx.fillStyle='blue'; ctx.fillRect(220,44,72,92);
ctx.strokeStyle='white'; ctx.lineWidth=3; ctx.strokeRect(12,18,290,130);
ctx.fillStyle='yellow'; ctx.font='18px sans-serif'; ctx.fillText('DOM 2D COMMANDS',22,168);

const off = new OffscreenCanvas(180,120);
const ox = off.getContext('2d');
const grad = ox.createLinearGradient(0,0,180,0); grad.addColorStop(0,'orange'); grad.addColorStop(1,'magenta');
ox.fillStyle=grad; ox.fillRect(0,0,180,120);
ox.globalAlpha=.8; ox.strokeStyle='cyan'; ox.lineWidth=5; ox.setLineDash([7,4]);
const path = new Path2D(); path.moveTo(12,88); path.bezierCurveTo(55,15,125,16,166,88); path.lineTo(12,88); path.closePath();
ox.stroke(path); ox.clip(path); ox.fillStyle='purple'; ox.fillRect(15,35,150,65);
ox.fillStyle='white'; ox.font='16px sans-serif'; ox.fillText('OFFSCREEN',26,65);
const id = ox.getImageData(0,0,4,4); ox.putImageData(id,8,8);
const offBitmap = off.transferToImageBitmap();
ctx.drawImage(offBitmap, 26, 184, 158, 60);

const worker = new Worker('worker-canvas.js');
worker.onmessage = e => {
  ctx.drawImage(e.data.bitmap, 216, 176, 150, 72);
  ctx.fillStyle='white'; ctx.font='14px sans-serif'; ctx.fillText('WORKER BITMAP '+e.data.status,220,250);
  window.appState.worker=e.data.status;
};
worker.postMessage({label:'BH'});

const glCanvas=document.getElementById('gl');
const gl=glCanvas.getContext('webgl');
gl.clearColor(0.12,0.08,0.48,1); gl.clear(gl.COLOR_BUFFER_BIT); gl.drawArrays(gl.TRIANGLES,0,3);
window.appState.ready=true;
window.appState.metrics=ctx.measureText('Merkava').width;
window.appState.commands=document.textureArena.snapshot().commands.length;
</script>
</body></html>`;

const files = {
  'index.html': html,
  'worker-canvas.js': `onmessage = e => { const off = new OffscreenCanvas(160,80); const x = off.getContext('2d'); x.fillStyle='black'; x.fillRect(0,0,160,80); x.fillStyle='lime'; x.fillRect(12,12,55,45); x.fillStyle='cyan'; x.fillRect(78,22,62,35); x.strokeStyle='white'; x.lineWidth=3; const p=new Path2D(); p.arc(82,40,28,0,6.283); x.stroke(p); x.fillStyle='yellow'; x.font='16px sans-serif'; x.fillText('WORKER',36,70); postMessage({ status:'OK', bitmap: off.transferToImageBitmap() }); };`
};

const result = await simulateRuntime({ runtime:'MekravaExecutor', entry:'index.html', files, snapshot:true, format:'png', fullPage:true, values:['window.appState'], waitMs:200 });
const snap = result.snapshot || {};
writeJson('snapshot.json', snap);
writeText('snapshot.html', snap.html || html);
writeJson('result.safe.json', {
  ok: result.ok,
  values: result.values,
  image: snap.image,
  canvasTextures: snap.canvas?.textures?.map(t => ({ id:t.id, kind:t.kind, commands:t.commands?.map(c => c.op), width:t.width, height:t.height })) || []
});
const picturePath = path.join(outDir, 'actual-merkava-picture.png');
if (snap.dataUrl) fs.writeFileSync(picturePath, Buffer.from(snap.dataUrl.replace(/^data:image\/png;base64,/, ''), 'base64'));
const textures = snap.canvas?.textures || [];
const commands = snap.canvas?.commands || [];
const commandOps = commands.map(c => c.op);
const featureChecks = {
  domCanvas: textures.some(t => t.kind === 'canvas-2d' && t.width === 420 && t.height === 260),
  offscreenCanvas: textures.some(t => t.kind === 'canvas-2d' && t.width === 180 && t.height === 120),
  workerCanvas: textures.some(t => t.kind === 'canvas-2d' && t.width === 160 && t.height === 80),
  webglCanvas: textures.some(t => t.kind === 'canvas-webgl' && t.width === 420 && t.height === 260),
  drawImageTexture: commandOps.includes('drawImageTexture'),
  path2d: commandOps.includes('strokePath') || commandOps.includes('clip'),
  imageData: commandOps.includes('getImageData') && commandOps.includes('putImageData'),
  webglDraw: commandOps.includes('webgl.drawArrays'),
  workerReply: result.values?.['window.appState']?.worker === 'OK'
};
const summary = {
  ok: result.ok,
  hasPicture: Boolean(snap.dataUrl),
  backend: snap.image?.backend,
  imageBytes: snap.image?.bytes,
  imageHash: fs.existsSync(picturePath) ? sha256(picturePath) : null,
  canvasTextureCount: textures.length,
  canvasCommandCount: commands.length,
  featureChecks,
  allFeaturesVisibleInSnapshot: Object.values(featureChecks).every(Boolean),
  files: { picture: rel(picturePath), result: rel(path.join(outDir,'result.safe.json')), snapshot: rel(path.join(outDir,'snapshot.json')) }
};
writeJson('summary.json', summary);
console.log(JSON.stringify(summary, null, 2));
if (!summary.ok || !summary.hasPicture || !summary.allFeaturesVisibleInSnapshot) process.exit(1);
