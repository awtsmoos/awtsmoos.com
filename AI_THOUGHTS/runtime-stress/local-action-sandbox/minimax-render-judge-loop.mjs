// B"H
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const here = path.dirname(fileURLToPath(import.meta.url));
const repo = path.resolve(here, '../../..');
const outDir = path.join(repo, 'AI_THOUGHTS/runtime-stress/local-action-sandbox/merkava-advanced-vision');
const picturePath = path.join(outDir, 'actual-merkava-picture.png');
const loopPath = path.join(outDir, 'minimax-judge-loop.json');
const key = readMiniMaxKey();

function readMiniMaxKey() {
  const direct = process.env.MINIMAX_API_KEY || process.env.MINIMAX_TOKEN || '';
  if (direct.trim()) return direct.trim();
  const keyFile = path.join(repo, '.awtsmoos/runtime/minimax.key');
  return fs.existsSync(keyFile) ? fs.readFileSync(keyFile, 'utf8').trim() : '';
}
function read(file) { try { return fs.readFileSync(path.join(repo, file), 'utf8'); } catch { return ''; } }
function writeJson(name, value) { fs.writeFileSync(path.join(outDir, name), JSON.stringify(value, null, 2)); }
function writeText(name, value) { fs.writeFileSync(path.join(outDir, name), String(value || '')); }
function existingLoop() { try { return JSON.parse(fs.readFileSync(loopPath, 'utf8')); } catch { return []; } }
function sourceDigest(file) {
  const text = read(file);
  return `--- ${file} ---\n` + text.split('\n').filter(line => /function |export |classDefaults|supersample|drawText|layoutGrid|paintCanvas|paintWebgl|PERFECT|NOT/.test(line)).slice(0, 80).join('\n');
}

if (!key) throw new Error('MINIMAX_API_KEY_missing');
if (!fs.existsSync(picturePath)) throw new Error('picture_missing:' + picturePath);
const prior = existingLoop();
const turn = prior.length + 1;
const imageDataUrl = `data:image/png;base64,${fs.readFileSync(picturePath).toString('base64')}`;
const summary = read('AI_THOUGHTS/runtime-stress/local-action-sandbox/merkava-advanced-vision/summary.json');
const result = read('AI_THOUGHTS/runtime-stress/local-action-sandbox/merkava-advanced-vision/result.safe.json');
const source = [
  'geelooy/scripts/awtsmoos/MerkavaExecutor/merkava-service/snapshots/software/domLayout.js',
  'geelooy/scripts/awtsmoos/MerkavaExecutor/merkava-service/snapshots/software/domPainter.js',
  'geelooy/scripts/awtsmoos/MerkavaExecutor/merkava-service/snapshots/software/canvasPainter.js',
  'geelooy/scripts/awtsmoos/MerkavaExecutor/merkava-service/snapshots/software/supersample.js'
].map(sourceDigest).join('\n\n');
const prompt = `B"H. Strict visual QA judge, turn ${turn}/6.\nLook at the attached renderer PNG. Decide if it is visually good enough.\n\nOutput exactly:\nPERFECT - yeah this is perfect\nOR\nNOT PERFECT\nThen give detailed critique and exact next fixes. Be harsh but concise.\n\nRender summary:\n${summary}\n\nResult:\n${result}\n\nSource digest:\n${source}`;
const payload = { model:'MiniMax-M3', messages:[{ role:'user', content:[{ type:'text', text:prompt }, { type:'image_url', image_url:{ url:imageDataUrl } }] }], stream:false, temperature:0.1, max_tokens:1200 };
writeJson(`minimax-judge-loop-request-${turn}.redacted.json`, { model:payload.model, max_tokens:payload.max_tokens, note:'image and auth redacted' });
const controller = new AbortController();
const timer = setTimeout(() => controller.abort(), 120000);
const res = await fetch('https://api.minimax.io/v1/chat/completions', { method:'POST', signal:controller.signal, headers:{ Authorization:`Bearer ${key}`, 'Content-Type':'application/json' }, body:JSON.stringify(payload) }).finally(() => clearTimeout(timer));
const text = await res.text();
writeText(`minimax-judge-loop-response-${turn}.raw.txt`, text);
let json = null; try { json = JSON.parse(text); } catch {}
const answer = json?.choices?.[0]?.message?.content || text;
writeText(`minimax-judge-loop-answer-${turn}.md`, answer);
const entry = { turn, generatedAt:new Date().toISOString(), ok:res.ok, status:res.status, perfect:/yeah this is perfect/i.test(answer) || /^\s*PERFECT\b/i.test(answer), answer };
const next = [...prior, entry];
fs.writeFileSync(loopPath, JSON.stringify(next, null, 2));
writeJson('minimax-judge-loop-summary.json', { turns:next.length, latest:{ turn, ok:res.ok, status:res.status, perfect:entry.perfect, answerLength:answer.length }, stopped:entry.perfect || next.length >= 6 });
console.log(JSON.stringify({ turn, ok:res.ok, status:res.status, perfect:entry.perfect, answer:answer.slice(0,1200) }, null, 2));
if (!res.ok) process.exit(1);
