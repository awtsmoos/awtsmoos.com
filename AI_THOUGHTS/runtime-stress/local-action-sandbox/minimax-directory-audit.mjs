// B"H
/**
 * Gives MiniMax a directory-level audit package for the advanced vision output.
 * MiniMax cannot mount the local filesystem, so this script discovers the
 * directory locally, extracts the important file contents, and sends that
 * discovered manifest as text for review.
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const here = path.dirname(fileURLToPath(import.meta.url));
const repo = path.resolve(here, '../../..');
const outDir = path.join(repo, 'AI_THOUGHTS/runtime-stress/local-action-sandbox/merkava-advanced-vision');
const key = readMiniMaxKey();

function readMiniMaxKey() {
  const direct = process.env.MINIMAX_API_KEY || process.env.MINIMAX_TOKEN || '';
  if (direct.trim()) return direct.trim();
  const keyFile = path.join(repo, '.awtsmoos/runtime/minimax.key');
  return fs.existsSync(keyFile) ? fs.readFileSync(keyFile, 'utf8').trim() : '';
}
function walk(dir) {
  const rows = [];
  for (const name of fs.readdirSync(dir).sort()) {
    const full = path.join(dir, name);
    const st = fs.statSync(full);
    rows.push({ path:path.relative(repo, full).replace(/\\/g, '/'), bytes:st.size, file:st.isFile(), mtimeMs:st.mtimeMs });
  }
  return rows;
}
function readMaybe(name, max = 14000) {
  const file = path.join(outDir, name);
  if (!fs.existsSync(file)) return `[missing ${name}]`;
  const text = fs.readFileSync(file, 'utf8');
  return text.length > max ? text.slice(0, max) + `\n...[truncated ${text.length - max} chars]` : text;
}
if (!key) throw new Error('MINIMAX_API_KEY_missing');
const manifest = walk(outDir);
const payloadText = `B"H. You are MiniMax reviewing a local directory discovered by a script. You cannot mount the filesystem directly, so below is the discovered directory tree and key file contents.\n\nTask: determine whether the latest Merkava advanced vision output is actually updated and whether it proves DOM Canvas2D, OffscreenCanvas, Worker-created canvas, Path2D, ImageData, drawImageTexture, and WebGL are present. Be detailed. If anything still looks unproven from the directory evidence, say exactly what.\n\nDIRECTORY TREE:\n${JSON.stringify(manifest, null, 2)}\n\nsummary.json:\n${readMaybe('summary.json')}\n\nresult.safe.json:\n${readMaybe('result.safe.json')}\n\nsnapshot.html:\n${readMaybe('snapshot.html', 9000)}\n\nadvanced harness source:\n${fs.readFileSync(path.join(repo, 'AI_THOUGHTS/runtime-stress/local-action-sandbox/merkava-advanced-vision-test.mjs'), 'utf8').slice(0, 14000)}\n`;
const request = { model:'MiniMax-M3', messages:[{ role:'user', content:payloadText }], stream:false, temperature:0.1, max_tokens:1800 };
fs.writeFileSync(path.join(outDir, 'minimax-directory-audit-request.redacted.json'), JSON.stringify({ model:request.model, bytes:payloadText.length, note:'text manifest sent; auth redacted' }, null, 2));
const res = await fetch('https://api.minimax.io/v1/chat/completions', { method:'POST', headers:{ Authorization:`Bearer ${key}`, 'Content-Type':'application/json' }, body:JSON.stringify(request) });
const text = await res.text();
fs.writeFileSync(path.join(outDir, 'minimax-directory-audit-response.raw.txt'), text);
let json = null; try { json = JSON.parse(text); } catch {}
const answer = json?.choices?.[0]?.message?.content || text;
fs.writeFileSync(path.join(outDir, 'minimax-directory-audit-answer.md'), answer);
fs.writeFileSync(path.join(outDir, 'minimax-directory-audit-summary.json'), JSON.stringify({ ok:res.ok, status:res.status, answerLength:answer.length }, null, 2));
console.log(JSON.stringify({ ok:res.ok, status:res.status, answer:answer.slice(0, 1600) }, null, 2));
if (!res.ok) process.exit(1);
