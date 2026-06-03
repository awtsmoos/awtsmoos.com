// B"H
/** Strict MiniMax audit for the brutal Layout Labyrinth witness. */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const here = path.dirname(fileURLToPath(import.meta.url));
const repo = path.resolve(here, '../../../../..');
const outDir = path.join(repo, 'AI_THOUGHTS/runtime-stress/local-action-sandbox/pixel-fidelity/layout-labyrinth');
const key = readKey();
if (!key) throw new Error('MINIMAX_API_KEY_missing');

const imagePath = path.join(outDir, 'layout-labyrinth.png');
const imageUrl = `data:image/png;base64,${fs.readFileSync(imagePath).toString('base64')}`;
const report = JSON.parse(fs.readFileSync(path.join(outDir, 'layout-labyrinth-report.json'), 'utf8'));
const compact = { pass: report.pass, image: report.image, checks: report.checks, textureCount: report.textures.length, colorStats: report.colorStats };
const prompt = `B"H. Strict visual QA for attached LAYOUT LABYRINTH renderer stress image.\n\nFIRST LINE ONLY ONE OF THESE:\nPASS - layout labyrinth is acceptable\nNOT PASS\n\nThen at most 5 specific fixable issues. Be harsh but concise. Judge deep nested grid/flex recognizability, row/column lattice clarity, overflow hidden/scroll visibility, transform matrix visibility, SVG witness, WebGL cube/state, and canvas density.\n\nCompact report:\n${JSON.stringify(compact, null, 2)}`;
const payload = { model:'MiniMax-M3', messages:[{ role:'user', content:[{ type:'text', text:prompt }, { type:'image_url', image_url:{ url:imageUrl } }] }], stream:false, temperature:0.05, max_tokens:900 };
fs.writeFileSync(path.join(outDir, 'minimax-labyrinth-audit-request.redacted.json'), JSON.stringify({ model:payload.model, promptBytes:prompt.length, imageBytes:fs.statSync(imagePath).size }, null, 2));
const res = await fetch('https://api.minimax.io/v1/chat/completions', { method:'POST', headers:{ Authorization:`Bearer ${key}`, 'Content-Type':'application/json' }, body:JSON.stringify(payload) });
const text = await res.text();
fs.writeFileSync(path.join(outDir, 'minimax-labyrinth-audit-response.raw.txt'), text);
let parsed = null;
try { parsed = JSON.parse(text); } catch {}
const answer = parsed?.choices?.[0]?.message?.content || text;
fs.writeFileSync(path.join(outDir, 'minimax-labyrinth-audit-answer.md'), answer);
fs.writeFileSync(path.join(outDir, 'minimax-labyrinth-audit-summary.json'), JSON.stringify({ ok:res.ok, status:res.status, pass:/^\s*PASS/i.test(answer), answerLength:answer.length }, null, 2));
console.log(JSON.stringify({ ok:res.ok, status:res.status, pass:/^\s*PASS/i.test(answer), answer:answer.slice(0,1800) }, null, 2));
if (!res.ok) process.exit(1);

function readKey() {
  const direct = process.env.MINIMAX_API_KEY || process.env.MINIMAX_TOKEN || '';
  if (direct.trim()) return direct.trim();
  const keyFile = path.join(repo, '.awtsmoos/runtime/minimax.key');
  return fs.existsSync(keyFile) ? fs.readFileSync(keyFile, 'utf8').trim() : '';
}
