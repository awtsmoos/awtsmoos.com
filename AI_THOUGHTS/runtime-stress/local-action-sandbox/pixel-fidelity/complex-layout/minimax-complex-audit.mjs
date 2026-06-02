// B"H
/**
 * MiniMax audit for the complex nested layout witness.
 * Sends the new complex screenshot plus local reports and asks for strict next
 * fixes. It also includes the baseline witness summary so MiniMax can compare
 * whether the renderer grew beyond the simple dashboard scene.
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const here = path.dirname(fileURLToPath(import.meta.url));
const repo = path.resolve(here, '../../../../..');
const outDir = path.join(repo, 'AI_THOUGHTS/runtime-stress/local-action-sandbox/pixel-fidelity/complex-layout');
const baseDir = path.join(repo, 'AI_THOUGHTS/runtime-stress/local-action-sandbox/pixel-fidelity');
const key = readKey();
if (!key) throw new Error('MINIMAX_API_KEY_missing');

const imagePath = path.join(outDir, 'complex-layout.png');
const imageUrl = `data:image/png;base64,${fs.readFileSync(imagePath).toString('base64')}`;
const prompt = `B"H. You are MiniMax strict visual QA for Merkava.\n\nThis is the new complex nested layout witness after fixes: nested grid, flex, forms, buttons, inputs, CSS glows, rainbow gradients, OffscreenCanvas, worker bitmap, nested drawImageTexture, Path2D, and WebGL.\n\nFIRST LINE MUST BE EXACTLY ONE OF:\nPASS - complex witness is acceptable\nNOT PASS\n\nThen explain the remaining issues and the top concrete code fixes. Be harsh. Distinguish proof-of-capability from browser-grade fidelity.\n\nComplex report:\n${read(path.join(outDir, 'complex-report.md'), 6000)}\n\nComplex JSON excerpt:\n${read(path.join(outDir, 'complex-report.json'), 12000)}\n\nBaseline report:\n${read(path.join(baseDir, 'report.md'), 5000)}\n\nSemantic baseline:\n${read(path.join(baseDir, 'semantic-report.md'), 5000)}`;
const payload = { model:'MiniMax-M3', messages:[{ role:'user', content:[{ type:'text', text:prompt }, { type:'image_url', image_url:{ url:imageUrl } }] }], stream:false, temperature:0.05, max_tokens:2200 };
fs.writeFileSync(path.join(outDir, 'minimax-complex-audit-request.redacted.json'), JSON.stringify({ model:payload.model, promptBytes:prompt.length, imageBytes:fs.statSync(imagePath).size }, null, 2));
const res = await fetch('https://api.minimax.io/v1/chat/completions', { method:'POST', headers:{ Authorization:`Bearer ${key}`, 'Content-Type':'application/json' }, body:JSON.stringify(payload) });
const text = await res.text();
fs.writeFileSync(path.join(outDir, 'minimax-complex-audit-response.raw.txt'), text);
let parsed = null;
try { parsed = JSON.parse(text); } catch {}
const answer = parsed?.choices?.[0]?.message?.content || text;
fs.writeFileSync(path.join(outDir, 'minimax-complex-audit-answer.md'), answer);
fs.writeFileSync(path.join(outDir, 'minimax-complex-audit-summary.json'), JSON.stringify({ ok:res.ok, status:res.status, pass:/^\s*PASS/i.test(answer), answerLength:answer.length }, null, 2));
console.log(JSON.stringify({ ok:res.ok, status:res.status, pass:/^\s*PASS/i.test(answer), answer:answer.slice(0, 1800) }, null, 2));
if (!res.ok) process.exit(1);

function read(file, max) { const text = fs.readFileSync(file, 'utf8'); return text.length > max ? text.slice(0, max) + '\n...[truncated]' : text; }
function readKey() { const direct = process.env.MINIMAX_API_KEY || process.env.MINIMAX_TOKEN || ''; if (direct.trim()) return direct.trim(); const keyFile = path.join(repo, '.awtsmoos/runtime/minimax.key'); return fs.existsSync(keyFile) ? fs.readFileSync(keyFile, 'utf8').trim() : ''; }
