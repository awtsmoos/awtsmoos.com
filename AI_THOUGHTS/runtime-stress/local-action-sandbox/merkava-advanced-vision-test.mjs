// B"H
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { simulateRuntime } from '../../../geelooy/scripts/awtsmoos/MerkavaExecutor/merkava-service/index.js';

const here = path.dirname(fileURLToPath(import.meta.url));
const repo = path.resolve(here, '../../..');
const outDir = path.join(repo, 'AI_THOUGHTS/runtime-stress/local-action-sandbox/merkava-advanced-vision');
fs.mkdirSync(outDir, { recursive: true });

function readMiniMaxKey() {
  const direct = process.env.MINIMAX_API_KEY || process.env.MINIMAX_TOKEN || '';
  if (direct.trim()) return direct.trim();
  const keyFile = path.join(repo, '.awtsmoos/runtime/minimax.key');
  if (fs.existsSync(keyFile)) return fs.readFileSync(keyFile, 'utf8').trim();
  return '';
}
function rel(p) { return path.relative(repo, p).replace(/\\/g, '/'); }
function safe(value) { return JSON.parse(JSON.stringify(value, (k, v) => k === 'dataUrl' || k === 'pngDataUrl' ? '[omitted-data-url]' : v)); }
function writeJson(name, value) { fs.writeFileSync(path.join(outDir, name), JSON.stringify(safe(value), null, 2)); }
function writeText(name, value) { fs.writeFileSync(path.join(outDir, name), String(value || '')); }

const html = `<!doctype html>
<html><head><title>Merkava Advanced Vision</title><style>
  body{margin:0;background:#090b12;color:#f6f6fa;font-family:system-ui,sans-serif}.shell{padding:28px}.grid{display:grid;grid-template-columns:1fr 1fr;gap:18px}.card{background:linear-gradient(135deg,#202333,#141721);border:1px solid #3d4966;border-radius:22px;padding:20px;box-shadow:0 18px 60px #0008}.hero{font-size:34px;font-weight:800}.pill{display:inline-block;background:#586fff;color:white;padding:10px 16px;border-radius:999px}.nested{margin-top:16px;background:#0f1320;border-radius:16px;padding:16px}.glow{border:2px solid #4ad2f0}.warn{color:#ffcf5a}</style></head>
<body><main class="shell"><section class="card glow"><h1 class="hero">B'H Merkava Advanced Vision</h1><p class="warn">Nested CSS, 2D canvas, and WebGL canvas should all be visible.</p><span class="pill">Repair Surface</span><div class="nested"><strong>Inner vessel</strong><p>Canvas below paints red, green, blue, and text.</p><canvas id="two" width="300" height="160"></canvas></div></section><section class="card"><h2>WebGL Vessel</h2><p>Virtual WebGL records clearColor and draw calls.</p><canvas id="gl" width="300" height="160"></canvas></section></main><script>
const c=document.getElementById('two'); const ctx=c.getContext('2d');
ctx.fillStyle='red'; ctx.fillRect(10,10,80,45); ctx.fillStyle='green'; ctx.fillRect(105,20,90,60); ctx.fillStyle='blue'; ctx.fillRect(205,30,70,80);
ctx.fillStyle='yellow'; ctx.font='20px sans-serif'; ctx.fillText('B"H 2D Canvas',30,135); ctx.beginPath(); ctx.moveTo(20,80); ctx.lineTo(140,70); ctx.lineTo(190,120); ctx.fillStyle='purple'; ctx.fill();
const gl=document.getElementById('gl').getContext('webgl'); gl.clearColor(0.2,0.1,0.6,1); gl.clear(gl.COLOR_BUFFER_BIT); gl.drawArrays(gl.TRIANGLES,0,3);
window.appState={ready:true,canvas2d:true,webgl:true,nested:true};
</script></body></html>`;

const result = await simulateRuntime({ runtime:'MekravaExecutor', entry:'index.html', files:{'index.html':html}, snapshot:true, format:'png', fullPage:true, values:['window.appState'] });
const snap = result.snapshot || {};
writeJson('snapshot.json', snap);
writeJson('result.safe.json', { ok: result.ok, values: result.values, image: snap.image, canvasTextures: snap.canvas?.textures?.map(t => ({ id:t.id, kind:t.kind, commands:t.commands?.length, width:t.width, height:t.height })) || [] });
if (snap.dataUrl) fs.writeFileSync(path.join(outDir, 'actual-merkava-picture.png'), Buffer.from(snap.dataUrl.replace(/^data:image\/png;base64,/, ''), 'base64'));
writeText('snapshot.html', snap.html || html);

const key = readMiniMaxKey();
let minimax = { skipped:true, reason:'MINIMAX_API_KEY_missing' };
if (key && snap.dataUrl) {
  const payload = { model:'MiniMax-M3', messages:[{ role:'user', content:[{ type:'text', text:`B"H. This is an actual image produced by simulateRuntime using backend ${snap.image?.backend}. Describe the DOM, CSS cards, 2D canvas, and WebGL evidence you can see. Mention whether it looks like canvas/WebGL are represented.` }, { type:'image_url', image_url:{ url:snap.dataUrl } }] }], stream:false, temperature:0.2, max_tokens:1000 };
  writeJson('minimax-request.redacted.json', { ...payload, messages:[{ role:'user', content:[payload.messages[0].content[0], { type:'image_url', image_url:{ url:'[omitted-data-url]' } }] }] });
  const res = await fetch('https://api.minimax.io/v1/chat/completions', { method:'POST', headers:{ Authorization:`Bearer ${key}`, 'Content-Type':'application/json' }, body:JSON.stringify(payload) });
  const text = await res.text();
  writeText('minimax-response.raw.txt', text);
  let json=null; try { json=JSON.parse(text); } catch {}
  writeJson('minimax-response.json', json || { parseError:true, text });
  const answer = json?.choices?.[0]?.message?.content || text;
  writeText('minimax-answer.md', answer);
  minimax = { ok:res.ok, status:res.status, answerLength:answer.length };
}
const summary = { ok: result.ok, hasPicture:Boolean(snap.dataUrl), backend:snap.image?.backend, fallbackReason:snap.image?.fallbackReason, imageBytes:snap.image?.bytes, canvasTextureCount:snap.canvas?.textures?.length || 0, canvasCommandCount:(snap.canvas?.commands || []).length, minimax, files:{ picture:rel(path.join(outDir,'actual-merkava-picture.png')), answer:rel(path.join(outDir,'minimax-answer.md')), result:rel(path.join(outDir,'result.safe.json')) } };
writeJson('summary.json', summary);
console.log(JSON.stringify(summary, null, 2));
if (!summary.ok || !summary.hasPicture || summary.canvasTextureCount < 2 || summary.canvasCommandCount < 4 || (key && !minimax.ok)) process.exit(1);
