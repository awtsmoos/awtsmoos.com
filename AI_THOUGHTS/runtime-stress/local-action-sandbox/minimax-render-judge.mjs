// B"H
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const here = path.dirname(fileURLToPath(import.meta.url));
const repo = path.resolve(here, '../../..');
const outDir = path.join(repo, 'AI_THOUGHTS/runtime-stress/local-action-sandbox/merkava-advanced-vision');
const key = readMiniMaxKey();
const picturePath = path.join(outDir, 'actual-merkava-picture.png');
const sourceFiles = [
  'geelooy/scripts/awtsmoos/MerkavaExecutor/merkava-service/snapshots/software/domLayout.js',
  'geelooy/scripts/awtsmoos/MerkavaExecutor/merkava-service/snapshots/software/domPainter.js',
  'geelooy/scripts/awtsmoos/MerkavaExecutor/merkava-service/snapshots/software/framebuffer.js',
  'geelooy/scripts/awtsmoos/MerkavaExecutor/merkava-service/snapshots/software/canvasPainter.js'
];
function readMiniMaxKey() {
  const direct = process.env.MINIMAX_API_KEY || process.env.MINIMAX_TOKEN || '';
  if (direct.trim()) return direct.trim();
  const keyFile = path.join(repo, '.awtsmoos/runtime/minimax.key');
  if (fs.existsSync(keyFile)) return fs.readFileSync(keyFile, 'utf8').trim();
  return '';
}
function write(name, value) { fs.writeFileSync(path.join(outDir, name), String(value || '')); }
function writeJson(name, value) { fs.writeFileSync(path.join(outDir, name), JSON.stringify(value, null, 2)); }
if (!key) throw new Error('MINIMAX_API_KEY_missing');
if (!fs.existsSync(picturePath)) throw new Error('picture_missing:' + picturePath);
const imageDataUrl = `data:image/png;base64,${fs.readFileSync(picturePath).toString('base64')}`;
const codeSummary = sourceFiles.map(file => `--- ${file} ---\n${fs.readFileSync(path.join(repo, file), 'utf8').slice(0, 4500)}`).join('\n\n');
const prompt = `B"H. You are the strict visual QA judge for Merkava's virtual DOM renderer.\n\nLook at the attached image AND read the source excerpts below. Decide if this renderer output is visually good enough to call perfect.\n\nRules:\n- If it is perfect, your answer MUST contain the exact phrase: yeah this is perfect\n- If not perfect, start with NOT PERFECT and list the concrete remaining visual/source issues and the next code fixes.\n- Be harsh. Do not flatter.\n\nSOURCE EXCERPTS:\n${codeSummary}`;
const payload = { model:'MiniMax-M3', messages:[{ role:'user', content:[{ type:'text', text: prompt }, { type:'image_url', image_url:{ url:imageDataUrl } }] }], stream:false, temperature:0.1, max_tokens:1800 };
writeJson('minimax-judge-request.redacted.json', { ...payload, messages:[{ role:'user', content:[{ type:'text', text:'[prompt omitted; source excerpts were included]' }, { type:'image_url', image_url:{ url:'[omitted-data-url]' } }] }] });
const res = await fetch('https://api.minimax.io/v1/chat/completions', { method:'POST', headers:{ Authorization:`Bearer ${key}`, 'Content-Type':'application/json' }, body:JSON.stringify(payload) });
const text = await res.text();
write('minimax-judge-response.raw.txt', text);
let json = null; try { json = JSON.parse(text); } catch {}
const answer = json?.choices?.[0]?.message?.content || text;
write('minimax-judge-answer.md', answer);
writeJson('minimax-judge-summary.json', { ok:res.ok, status:res.status, perfect:/yeah this is perfect/i.test(answer), answerLength:answer.length });
console.log(JSON.stringify({ ok:res.ok, status:res.status, perfect:/yeah this is perfect/i.test(answer), answer:answer.slice(0,1200) }, null, 2));
if (!res.ok) process.exit(1);
