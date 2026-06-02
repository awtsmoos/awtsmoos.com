// B"H
/**
 * Strict MiniMax audit for the current mega witness, compact prompt edition.
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const here = path.dirname(fileURLToPath(import.meta.url));
const repo = path.resolve(here, '../../../../..');
const outDir = path.join(repo, 'AI_THOUGHTS/runtime-stress/local-action-sandbox/pixel-fidelity/mega-layout');
const key = readKey();
if (!key) throw new Error('MINIMAX_API_KEY_missing');

const imagePath = path.join(outDir, 'mega-layout.png');
const imageUrl = `data:image/png;base64,${fs.readFileSync(imagePath).toString('base64')}`;
const report = JSON.parse(fs.readFileSync(path.join(outDir, 'mega-report.json'), 'utf8'));
const compact = {
  pass: report.pass,
  image: report.image,
  checks: report.checks,
  webglOps: report.textures.find(t => t.kind === 'canvas-webgl')?.ops || [],
  textureCount: report.textures.length,
  commandCount: report.commandOps.length,
  colorStats: report.colorStats
};
const prompt = `B"H. Strict visual QA for the attached current MEGA Merkava renderer stress image.\n\nFIRST LINE ONLY ONE OF THESE:\nPASS - mega witness is acceptable\nNOT PASS\n\nThen at most 4 concrete fixable issues. Be harsh but concise. Claims: grid span, nested flex, dark controls, offscreen nested canvas, worker bitmap, Path2D, gradients, WebGL program+texture witness.\n\nCompact report:\n${JSON.stringify(compact, null, 2)}`;
const payload = { model:'MiniMax-M3', messages:[{ role:'user', content:[{ type:'text', text:prompt }, { type:'image_url', image_url:{ url:imageUrl } }] }], stream:false, temperature:0.05, max_tokens:900 };
fs.writeFileSync(path.join(outDir, 'minimax-mega-audit-request.redacted.json'), JSON.stringify({ model:payload.model, promptBytes:prompt.length, imageBytes:fs.statSync(imagePath).size }, null, 2));
const res = await fetch('https://api.minimax.io/v1/chat/completions', { method:'POST', headers:{ Authorization:`Bearer ${key}`, 'Content-Type':'application/json' }, body:JSON.stringify(payload) });
const text = await res.text();
fs.writeFileSync(path.join(outDir, 'minimax-mega-audit-response.raw.txt'), text);
let parsed = null;
try { parsed = JSON.parse(text); } catch {}
const answer = parsed?.choices?.[0]?.message?.content || text;
fs.writeFileSync(path.join(outDir, 'minimax-mega-audit-answer.md'), answer);
fs.writeFileSync(path.join(outDir, 'minimax-mega-audit-summary.json'), JSON.stringify({ ok:res.ok, status:res.status, pass:/^\s*PASS/i.test(answer), answerLength:answer.length }, null, 2));
console.log(JSON.stringify({ ok:res.ok, status:res.status, pass:/^\s*PASS/i.test(answer), answer:answer.slice(0,1800) }, null, 2));
if (!res.ok) process.exit(1);
function readKey(){const direct=process.env.MINIMAX_API_KEY||process.env.MINIMAX_TOKEN||'';if(direct.trim())return direct.trim();const keyFile=path.join(repo,'.awtsmoos/runtime/minimax.key');return fs.existsSync(keyFile)?fs.readFileSync(keyFile,'utf8').trim():'';}
