// B"H
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
const here = path.dirname(fileURLToPath(import.meta.url));
const repo = path.resolve(here, '../../../../..');
const outDir = path.join(repo, 'AI_THOUGHTS/runtime-stress/local-action-sandbox/pixel-fidelity/complex-layout');
const key = readKey();
if (!key) throw new Error('MINIMAX_API_KEY_missing');
const imagePath = path.join(outDir, 'complex-layout.png');
const imageUrl = `data:image/png;base64,${fs.readFileSync(imagePath).toString('base64')}`;
const report = fs.readFileSync(path.join(outDir, 'complex-report.md'), 'utf8');
const json = fs.readFileSync(path.join(outDir, 'complex-report.json'), 'utf8');
const prompt = `B"H. Strict visual QA for ONLY the current attached complex-layout image. Ignore stale previous screenshots.\n\nFIRST LINE EXACTLY:\nPASS - current complex witness is acceptable\nOR\nNOT PASS\n\nThen give at most 4 concrete remaining issues. Current report:\n${report}\n\nCurrent JSON excerpt:\n${json.slice(0,9000)}`;
const payload = { model:'MiniMax-M3', messages:[{ role:'user', content:[{ type:'text', text:prompt }, { type:'image_url', image_url:{ url:imageUrl } }] }], stream:false, temperature:0.05, max_tokens:1000 };
const res = await fetch('https://api.minimax.io/v1/chat/completions', { method:'POST', headers:{ Authorization:`Bearer ${key}`, 'Content-Type':'application/json' }, body:JSON.stringify(payload) });
const text = await res.text();
fs.writeFileSync(path.join(outDir, 'minimax-current-complex-audit-response.raw.txt'), text);
let parsed = null; try { parsed = JSON.parse(text); } catch {}
const answer = parsed?.choices?.[0]?.message?.content || text;
fs.writeFileSync(path.join(outDir, 'minimax-current-complex-audit-answer.md'), answer);
fs.writeFileSync(path.join(outDir, 'minimax-current-complex-audit-summary.json'), JSON.stringify({ ok:res.ok, status:res.status, pass:/^\s*PASS/i.test(answer), answerLength:answer.length }, null, 2));
console.log(JSON.stringify({ ok:res.ok, status:res.status, pass:/^\s*PASS/i.test(answer), answer:answer.slice(0,1600) }, null, 2));
if (!res.ok) process.exit(1);
function readKey(){const direct=process.env.MINIMAX_API_KEY||process.env.MINIMAX_TOKEN||'';if(direct.trim())return direct.trim();const keyFile=path.join(repo,'.awtsmoos/runtime/minimax.key');return fs.existsSync(keyFile)?fs.readFileSync(keyFile,'utf8').trim():'';}
