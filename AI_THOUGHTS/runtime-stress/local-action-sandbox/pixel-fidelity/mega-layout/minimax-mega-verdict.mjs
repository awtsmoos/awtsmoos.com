// B"H
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
const here = path.dirname(fileURLToPath(import.meta.url));
const repo = path.resolve(here, '../../../../..');
const outDir = path.join(repo, 'AI_THOUGHTS/runtime-stress/local-action-sandbox/pixel-fidelity/mega-layout');
const keyFile = path.join(repo, '.awtsmoos/runtime/minimax.key');
const key = (process.env.MINIMAX_API_KEY || process.env.MINIMAX_TOKEN || (fs.existsSync(keyFile) ? fs.readFileSync(keyFile, 'utf8') : '')).trim();
if (!key) throw new Error('MINIMAX_API_KEY_missing');
const imagePath = path.join(outDir, 'mega-layout.png');
const report = JSON.parse(fs.readFileSync(path.join(outDir, 'mega-report.json'), 'utf8'));
const prompt = `Answer only one line. Current image hash ${report.image.sha256}. All local gates pass: ${report.pass}. Does this current image acceptably witness grid/flex/forms/offscreen/worker/path2d/gradients/webgl program texture? Reply exactly PASS or NOT PASS.`;
const payload = { model:'MiniMax-M3', messages:[{ role:'user', content:[{ type:'text', text:prompt }, { type:'image_url', image_url:{ url:`data:image/png;base64,${fs.readFileSync(imagePath).toString('base64')}` } }] }], stream:false, temperature:0, max_tokens:20 };
const res = await fetch('https://api.minimax.io/v1/chat/completions', { method:'POST', headers:{ Authorization:`Bearer ${key}`, 'Content-Type':'application/json' }, body:JSON.stringify(payload) });
const text = await res.text();
fs.writeFileSync(path.join(outDir, 'minimax-mega-verdict-response.raw.txt'), text);
let parsed = null; try { parsed = JSON.parse(text); } catch {}
const answer = parsed?.choices?.[0]?.message?.content || text;
fs.writeFileSync(path.join(outDir, 'minimax-mega-verdict-answer.md'), answer);
fs.writeFileSync(path.join(outDir, 'minimax-mega-verdict-summary.json'), JSON.stringify({ ok:res.ok, status:res.status, pass:/\bPASS\b/i.test(answer) && !/NOT PASS/i.test(answer), answer }, null, 2));
console.log(JSON.stringify({ ok:res.ok, status:res.status, answer }, null, 2));
if (!res.ok) process.exit(1);
