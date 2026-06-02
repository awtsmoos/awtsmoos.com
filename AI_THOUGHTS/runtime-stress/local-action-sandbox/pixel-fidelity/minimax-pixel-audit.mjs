// B"H
/**
 * MiniMax audit for the first pixel-fidelity witness.
 * Sends directory-discovered evidence and report text. The image file path/hash
 * is included; if MiniMax rejects image uploads, this still lets it review the
 * proof structure and remaining gaps.
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const here = path.dirname(fileURLToPath(import.meta.url));
const repo = path.resolve(here, '../../../..');
const outDir = path.join(repo, 'AI_THOUGHTS/runtime-stress/local-action-sandbox/pixel-fidelity');
const key = readKey();
if (!key) throw new Error('MINIMAX_API_KEY_missing');

const files = fs.readdirSync(outDir).sort().map(name => {
  const full = path.join(outDir, name);
  const stat = fs.statSync(full);
  return { name, bytes: stat.size, mtimeMs: stat.mtimeMs };
});
const report = fs.readFileSync(path.join(outDir, 'report.md'), 'utf8');
const json = fs.readFileSync(path.join(outDir, 'report.json'), 'utf8');
const prompt = `B"H. Review this Merkava pixel-fidelity witness. Be strict.\n\nThe generated next image is merkava-render-next.png. The proof map is color-proof-map.png. The gate passes if required colors and feature metadata are visible/present.\n\nDirectory files:\n${JSON.stringify(files, null, 2)}\n\nReport markdown:\n${report}\n\nReport json:\n${json}\n\nQuestion: Does this prove the next step is improved beyond command capture? What are the top remaining coding priorities?`;
const payload = { model:'MiniMax-M3', messages:[{ role:'user', content:prompt }], stream:false, temperature:0.1, max_tokens:1400 };
fs.writeFileSync(path.join(outDir, 'minimax-pixel-audit-request.redacted.json'), JSON.stringify({ model:payload.model, promptBytes:prompt.length }, null, 2));
const res = await fetch('https://api.minimax.io/v1/chat/completions', { method:'POST', headers:{ Authorization:`Bearer ${key}`, 'Content-Type':'application/json' }, body:JSON.stringify(payload) });
const text = await res.text();
fs.writeFileSync(path.join(outDir, 'minimax-pixel-audit-response.raw.txt'), text);
let parsed = null;
try { parsed = JSON.parse(text); } catch {}
const answer = parsed?.choices?.[0]?.message?.content || text;
fs.writeFileSync(path.join(outDir, 'minimax-pixel-audit-answer.md'), answer);
fs.writeFileSync(path.join(outDir, 'minimax-pixel-audit-summary.json'), JSON.stringify({ ok:res.ok, status:res.status, answerLength:answer.length }, null, 2));
console.log(JSON.stringify({ ok:res.ok, status:res.status, answer:answer.slice(0, 1600) }, null, 2));
if (!res.ok) process.exit(1);

function readKey() {
  const direct = process.env.MINIMAX_API_KEY || process.env.MINIMAX_TOKEN || '';
  if (direct.trim()) return direct.trim();
  const keyFile = path.join(repo, '.awtsmoos/runtime/minimax.key');
  return fs.existsSync(keyFile) ? fs.readFileSync(keyFile, 'utf8').trim() : '';
}
