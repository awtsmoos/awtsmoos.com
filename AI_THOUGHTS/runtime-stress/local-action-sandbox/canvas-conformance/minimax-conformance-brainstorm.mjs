// B"H
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
const here = path.dirname(fileURLToPath(import.meta.url));
const repo = path.resolve(here, '../../../..');
const outDir = path.join(repo, 'AI_THOUGHTS/runtime-stress/local-action-sandbox/canvas-conformance');
const key = readKey();
if (!key) throw new Error('MINIMAX_API_KEY_missing');
const report = fs.readFileSync(path.join(outDir, 'conformance-report.md'), 'utf8');
const prompt = `B"H. Merkava first Canvas conformance wave now passes 22/22.\n\n${report}\n\nBrainstorm next coding steps. Be strict. Current known gap: this proves API command capture and snapshot preservation, not browser-pixel fidelity. Give top 5 remaining gaps, 3 next executable tests, and the next subsystem to code.`;
const payload = { model:'MiniMax-M3', messages:[{ role:'user', content:prompt }], stream:false, temperature:0.1, max_tokens:1000 };
const res = await fetch('https://api.minimax.io/v1/chat/completions', { method:'POST', headers:{ Authorization:`Bearer ${key}`, 'Content-Type':'application/json' }, body:JSON.stringify(payload) });
const text = await res.text();
fs.writeFileSync(path.join(outDir, 'minimax-brainstorm-response.raw.txt'), text);
let json = null; try { json = JSON.parse(text); } catch {}
const answer = json?.choices?.[0]?.message?.content || text;
fs.writeFileSync(path.join(outDir, 'minimax-brainstorm-answer.md'), answer);
fs.writeFileSync(path.join(outDir, 'minimax-brainstorm-summary.json'), JSON.stringify({ ok:res.ok, status:res.status, answerLength:answer.length }, null, 2));
console.log(JSON.stringify({ ok:res.ok, status:res.status, answer:answer.slice(0, 1200) }, null, 2));
if (!res.ok) process.exit(1);
function readKey() { const direct = process.env.MINIMAX_API_KEY || process.env.MINIMAX_TOKEN || ''; if (direct.trim()) return direct.trim(); const keyFile = path.join(repo, '.awtsmoos/runtime/minimax.key'); return fs.existsSync(keyFile) ? fs.readFileSync(keyFile, 'utf8').trim() : ''; }
