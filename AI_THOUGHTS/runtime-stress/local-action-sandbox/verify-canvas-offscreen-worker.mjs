// B"H
import fs from 'fs';
import path from 'path';
import { simulateRuntime } from '../../../geelooy/scripts/awtsmoos/MerkavaExecutor/merkava-service/index.js';

const outDir = 'AI_THOUGHTS/runtime-stress/local-action-sandbox/canvas-offscreen-worker';
fs.mkdirSync(outDir, { recursive: true });
const html = `<!doctype html><html><body><canvas id="main" width="360" height="240"></canvas><script>
window.results = { started: true };
const off = new OffscreenCanvas(180, 100);
const ctx = off.getContext('2d');
ctx.save();
ctx.globalAlpha = 0.65;
ctx.globalCompositeOperation = 'multiply';
ctx.filter = 'blur(1px)';
ctx.shadowColor = 'rgba(0,0,0,.5)';
ctx.shadowBlur = 4;
ctx.fillStyle = ctx.createLinearGradient(0, 0, 180, 0);
ctx.fillStyle.addColorStop(0, 'red');
ctx.fillStyle.addColorStop(1, 'blue');
ctx.fillRect(0, 0, 80, 40);
ctx.strokeStyle = 'cyan';
ctx.lineWidth = 3;
ctx.setLineDash([5, 3]);
ctx.translate(8, 6);
ctx.rotate(0.2);
const p = new Path2D();
p.moveTo(12, 12); p.lineTo(120, 20); p.bezierCurveTo(160, 30, 130, 90, 30, 85); p.closePath();
ctx.stroke(p);
ctx.clip(p);
ctx.fillStyle = 'yellow';
ctx.fillText('MERKAVA OFFSCREEN GLYPHS', 12, 62);
const img = ctx.getImageData(0, 0, 3, 3);
ctx.putImageData(img, 4, 4);
ctx.restore();
const bitmap = off.transferToImageBitmap();
const main = document.getElementById('main');
const mainCtx = main.getContext('2d');
mainCtx.drawImage(bitmap, 10, 10, 160, 90);
const glOff = new OffscreenCanvas(128, 96);
const gl = glOff.getContext('webgl');
gl.clearColor(0.2, 0.1, 0.8, 1); gl.clear(gl.COLOR_BUFFER_BIT); gl.drawArrays(gl.TRIANGLES, 0, 3);
const worker = new Worker('worker.js');
worker.onmessage = e => { window.results.worker = e.data; };
worker.postMessage({ amount: 12 });
window.results.metrics = mainCtx.measureText('Merkava').width;
window.results.transform = mainCtx.getTransform().toJSON();
window.results.bitmap = { width: bitmap.width, height: bitmap.height };
window.results.commandsAtScriptEnd = document.textureArena.snapshot().commands.length;
</script></body></html>`;
const files = {
  'index.html': html,
  'worker.js': `onmessage = e => { const canvas = new OffscreenCanvas(24, 24); const ctx = canvas.getContext('2d'); ctx.fillStyle = 'green'; ctx.fillRect(0, 0, 24, 24); const p = new Path2D(); p.rect(1,1,8,8); ctx.stroke(p); postMessage({ ok: true, amount: e.data.amount, width: canvas.width }); };`
};
const result = await simulateRuntime({ runtime:'MekravaExecutor', entry:'index.html', files, snapshot:true, format:'json', values:['window.results'], waitMs:150 });
const textures = result.snapshot?.canvas?.textures || [];
const commands = result.snapshot?.canvas?.commands || [];
const commandNames = commands.map(c => c.op);
const report = {
  ok: result.ok,
  errors: result.errors || [],
  values: result.values,
  textureCount: textures.length,
  textures: textures.map(t => ({ id:t.id, kind:t.kind, width:t.width, height:t.height, commands:t.commands.map(c => c.op) })),
  commandCount: commands.length,
  featureChecks: {
    offscreen2dTexture: textures.some(t => t.kind === 'canvas-2d' && t.width === 180 && t.height === 100),
    domCanvasTexture: textures.some(t => t.kind === 'canvas-2d' && t.width === 360 && t.height === 240),
    offscreenWebglTexture: textures.some(t => t.kind === 'canvas-webgl' && t.width === 128 && t.height === 96),
    workerOffscreenTexture: textures.some(t => t.kind === 'canvas-2d' && t.width === 24 && t.height === 24),
    workerReply: result.values?.['window.results']?.worker?.ok === true,
    path2dRecorded: commandNames.includes('strokePath') || commandNames.includes('clip'),
    imageDataRecorded: commandNames.includes('getImageData') && commandNames.includes('putImageData'),
    drawImageRecorded: commandNames.includes('drawImageTexture'),
    webglRecorded: commandNames.includes('webgl.drawArrays'),
    textMetrics: Number(result.values?.['window.results']?.metrics || 0) > 0
  }
};
report.passed = report.ok && Object.values(report.featureChecks).every(Boolean);
fs.writeFileSync(path.join(outDir, 'report.json'), JSON.stringify(report, null, 2));
fs.writeFileSync(path.join(outDir, 'report.md'), `# B"H Canvas / OffscreenCanvas / Worker Verification\n\nPassed: ${report.passed}\n\n- Runtime ok: ${report.ok}\n- Texture count: ${report.textureCount}\n- Command count: ${report.commandCount}\n- Worker reply: ${JSON.stringify(result.values?.['window.results']?.worker)}\n\n## Feature checks\n\n${Object.entries(report.featureChecks).map(([k,v]) => `- ${k}: ${v}`).join('\n')}\n`);
console.log(JSON.stringify(report, null, 2));
process.exit(report.passed ? 0 : 1);
