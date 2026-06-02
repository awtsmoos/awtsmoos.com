// B"H
/**
 * MiniMax visual QA loop runner, one turn at a time.
 *
 * This script appends one MiniMax turn to minimax-visual-loop.json using the
 * current PNG plus semantic reports. It asks for the verdict first so the pass
 * parser is not defeated by a long hidden reasoning prelude.
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const here = path.dirname(fileURLToPath(import.meta.url));
const repo = path.resolve(here, '../../../..');
const outDir = path.join(repo, 'AI_THOUGHTS/runtime-stress/local-action-sandbox/pixel-fidelity');
const key = readKey();
if (!key) throw new Error('MINIMAX_API_KEY_missing');

const loopPath = path.join(outDir, 'minimax-visual-loop.json');
const turns = fs.existsSync(loopPath) ? JSON.parse(fs.readFileSync(loopPath, 'utf8')) : [];
const turn = turns.length + 1;
const imagePath = path.join(outDir, 'merkava-render-next.png');
const imageUrl = `data:image/png;base64,${fs.readFileSync(imagePath).toString('base64')}`;
const report = read('report.md', 5000);
const semantic = read('semantic-report.md', 5000);
const semanticJson = read('semantic-report.json', 12000);
const prompt = `B"H. You are MiniMax strict visual QA for Merkava renderer. This is turn ${turn}.\n\nFIRST LINE MUST BE EXACTLY ONE OF:\nPASS - yeah this is perfect enough\nNOT PASS\n\nThen explain. Look at the screenshot image and reports. Judge what is still not browser-grade. If NOT PASS, list max 5 concrete fixable issues in priority order and name the likely subsystem/file. Distinguish aesthetics from real fidelity bugs.\n\nPixel report:\n${report}\n\nSemantic report:\n${semantic}\n\nSemantic json excerpt:\n${semanticJson}`;
const payload = { model:'MiniMax-M3', messages:[{ role:'user', content:[{ type:'text', text:prompt }, { type:'image_url', image_url:{ url:imageUrl } }] }], stream:false, temperature:0.05, max_tokens:2200 };
fs.writeFileSync(path.join(outDir, `minimax-visual-loop-request-${turn}.redacted.json`), JSON.stringify({ turn, model:payload.model, promptBytes:prompt.length, imageBytes:fs.statSync(imagePath).size }, null, 2));
const res = await fetch('https://api.minimax.io/v1/chat/completions', { method:'POST', headers:{ Authorization:`Bearer ${key}`, 'Content-Type':'application/json' }, body:JSON.stringify(payload) });
const text = await res.text();
fs.writeFileSync(path.join(outDir, `minimax-visual-loop-response-${turn}.raw.txt`), text);
let parsed = null;
try { parsed = JSON.parse(text); } catch {}
const answer = parsed?.choices?.[0]?.message?.content || text;
fs.writeFileSync(path.join(outDir, `minimax-visual-loop-answer-${turn}.md`), answer);
const pass = /^\s*PASS\s*-\s*yeah this is perfect enough/i.test(answer) || /yeah this is perfect enough/i.test(answer);
const entry = { turn, generatedAt:new Date().toISOString(), ok:res.ok, status:res.status, pass, answer };
turns.push(entry);
fs.writeFileSync(loopPath, JSON.stringify(turns, null, 2));
fs.writeFileSync(path.join(outDir, 'minimax-visual-loop-summary.json'), JSON.stringify({ turns:turns.length, latest:{ turn, ok:res.ok, status:res.status, pass:entry.pass, answerLength:answer.length } }, null, 2));
console.log(JSON.stringify({ turn, ok:res.ok, status:res.status, pass:entry.pass, answer:answer.slice(0, 1800) }, null, 2));
if (!res.ok) process.exit(1);

function readKey() {
  const direct = process.env.MINIMAX_API_KEY || process.env.MINIMAX_TOKEN || '';
  if (direct.trim()) return direct.trim();
  const keyFile = path.join(repo, '.awtsmoos/runtime/minimax.key');
  return fs.existsSync(keyFile) ? fs.readFileSync(keyFile, 'utf8').trim() : '';
}
function read(name, max) {
  const text = fs.readFileSync(path.join(outDir, name), 'utf8');
  return text.length > max ? text.slice(0, max) + '\n...[truncated]' : text;
}
