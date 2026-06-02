// B"H
import fs from 'fs';
import path from 'path';
import { simulateRuntime } from '../../../geelooy/scripts/awtsmoos/MerkavaExecutor/merkava-service/index.js';

const out = 'AI_THOUGHTS/runtime-stress/local-action-sandbox/merkava-render-pipeline-verify';
fs.mkdirSync(out, { recursive: true });

const html = `<!doctype html><html><body style="margin:0;background:#090b12;color:#f6f6fa;padding:24px"><main style="background:#1d2030;padding:24px;border:3px solid #4ad2f0;width:850px"><h1 style="color:#ffffff;font-size:28px">B'H Real Renderer Gate</h1><section style="background:#112a2f;padding:14px;border:2px solid #52c878;margin:12px"><p style="color:#ffcf5a;font-size:18px">Nested DOM and inline CSS must draw as pixels.</p><button style="background:#586fff;color:#ffffff;width:180px;height:48px;border:2px solid #ffffff">Repair</button><canvas id="two" width="300" height="160" style="width:300px;height:160px;border:2px solid #ffffff;margin:8px"></canvas></section><section style="background:#2a1746;padding:14px;border:2px solid #a56bff;margin:12px"><canvas id="gl" width="300" height="160" style="width:300px;height:160px;border:2px solid #ffffff"></canvas></section></main><script>
const c=document.getElementById('two'); c.width=300; c.height=160; const ctx=c.getContext('2d');
ctx.fillStyle='red'; ctx.fillRect(10,10,80,45); ctx.fillStyle='green'; ctx.fillRect(105,20,90,60); ctx.fillStyle='blue'; ctx.fillRect(205,30,70,80); ctx.fillStyle='yellow'; ctx.font='20px sans-serif'; ctx.fillText('BH TEXT',30,135); ctx.beginPath(); ctx.moveTo(20,90); ctx.lineTo(160,70); ctx.lineTo(220,135); ctx.fillStyle='purple'; ctx.fill();
const gl=document.getElementById('gl').getContext('webgl'); gl.clearColor(0.2,0.1,0.6,1); gl.clear(gl.COLOR_BUFFER_BIT); gl.drawArrays(gl.TRIANGLES,0,3);
window.appState={dom:true,css:true,canvas2d:true,webgl:true};
</script></body></html>`;

const result = await simulateRuntime({ runtime:'MekravaExecutor', entry:'index.html', files:{'index.html':html}, snapshot:true, format:'png', snapshotBackend:'merkava', fullPage:true, width:960, height:640, values:['window.appState'] });
const snap = result.snapshot || {};
const pngPath = `${out}/actual-render.png`;
if (snap.dataUrl) fs.writeFileSync(pngPath, Buffer.from(snap.dataUrl.replace(/^data:image\/png;base64,/, ''), 'base64'));
const summary = {
  ok: result.ok,
  backend: snap.image?.backend,
  bytes: snap.image?.bytes || 0,
  proof: snap.image?.proof || null,
  values: result.values,
  canvasTextures: snap.canvas?.textures?.map(t => ({ kind:t.kind, width:t.width, height:t.height, commands:t.commands?.map(c => c.op) })) || [],
  pngPath
};
fs.writeFileSync(`${out}/summary.json`, JSON.stringify(summary, null, 2));
fs.writeFileSync(`${out}/snapshot.safe.json`, JSON.stringify({ ...snap, dataUrl:'[omitted]', pngDataUrl:'[omitted]', image:{ ...snap.image, dataUrl:'[omitted]' } }, null, 2));
console.log(JSON.stringify(summary, null, 2));
const ops = summary.canvasTextures.flatMap(t => t.commands || []);
const pass = summary.ok && summary.backend === 'merkava-software-webgl-dom' && summary.bytes > 1000 && summary.proof?.nonBackgroundPixels > 50000 && summary.canvasTextures.length >= 2 && ops.includes('fillRect') && ops.includes('fillTextPlaceholder') && ops.includes('webgl.drawArrays');
if (!pass) process.exit(1);
