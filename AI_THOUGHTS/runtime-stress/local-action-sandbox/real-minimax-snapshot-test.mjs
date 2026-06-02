// B"H
/**
 * Real MiniMax + simulateRuntime snapshot integration test.
 *
 * This version uses the fixed Merkava snapshot image directly. No synthetic
 * per-test fallback image is generated here. If Chrome is present, the snapshot
 * is a Chrome screenshot. If not, the snapshot is a labeled Merkava virtual PNG.
 */
import fs from 'fs';
import path from 'path';
import cp from 'child_process';
import { fileURLToPath } from 'url';
import { simulateRuntime } from '../../../geelooy/scripts/awtsmoos/MerkavaExecutor/merkava-service/index.js';

const here = path.dirname(fileURLToPath(import.meta.url));
const repo = path.resolve(here, '../../..');
const outDir = path.join(repo, 'AI_THOUGHTS/runtime-stress/local-action-sandbox/real-minimax-snapshot');
const endpoint = 'https://api.minimax.io/v1/chat/completions';
const model = process.env.MINIMAX_REAL_TEST_MODEL || 'MiniMax-M3';
const apiKey = readMiniMaxKey();
fs.mkdirSync(outDir, { recursive: true });

function readMiniMaxKey() {
  const direct = process.env.MINIMAX_API_KEY || process.env.MINIMAX_TOKEN || '';
  if (direct.trim()) return direct.trim();
  const keyFile = path.join(repo, '.awtsmoos/runtime/minimax.key');
  if (fs.existsSync(keyFile)) return fs.readFileSync(keyFile, 'utf8').trim();
  const jsonFile = path.join(repo, '.awtsmoos/runtime/minimax-game-keys.json');
  if (!fs.existsSync(jsonFile)) return '';
  try {
    const json = JSON.parse(fs.readFileSync(jsonFile, 'utf8'));
    return String(json.key || json.apiKey || json.MINIMAX_API_KEY || json.token || json.keys?.[0] || '').trim();
  } catch (_error) { return ''; }
}

function safeClone(value, seen = new WeakSet(), depth = 0) {
  if (value == null || typeof value !== 'object') return value;
  if (seen.has(value)) return '[Circular]';
  if (depth > 7) return '[DepthLimit]';
  seen.add(value);
  if (Array.isArray(value)) return value.slice(0, 80).map(item => safeClone(item, seen, depth + 1));
  const out = {};
  for (const key of Object.keys(value).slice(0, 160)) {
    if (key === 'dataUrl' || key === 'pngDataUrl') { out[key] = '[omitted-data-url]'; continue; }
    try { out[key] = safeClone(value[key], seen, depth + 1); } catch (error) { out[key] = `[Uncloneable:${error.message}]`; }
  }
  return out;
}

function rel(file) { return path.relative(repo, file).replace(/\\/g, '/'); }
function writeJson(name, value) { const file = path.join(outDir, name); fs.writeFileSync(file, JSON.stringify(safeClone(value), null, 2)); return rel(file); }
function writeText(name, value) { const file = path.join(outDir, name); fs.writeFileSync(file, String(value || '')); return rel(file); }
function writeSnapshotPng(snapshot) { const file = path.join(outDir, 'snapshot-render.png'); fs.writeFileSync(file, Buffer.from(snapshot.dataUrl.replace(/^data:image\/png;base64,/, ''), 'base64')); return rel(file); }

async function runSnapshot() {
  const html = `<!doctype html><html><body style="font-family:sans-serif;margin:0;background:#111;color:#f7f7f7"><main style="padding:24px"><h1>B'H Awtsmoos Runtime App</h1><p id="status">Snapshot target ready.</p><button style="font-size:18px;padding:12px 18px;border-radius:12px;background:#4873ff;color:white">Begin Repair</button><section style="margin-top:20px;background:#222;padding:16px;border-radius:16px"><h2>Issues</h2><ul><li>Button needs stronger contrast.</li><li>Status text should explain next action.</li></ul></section><script>window.appState={ready:true,issueCount:2};globalThis.appState=window.appState;</script></main></body></html>`;
  const result = await simulateRuntime({ runtime: 'MekravaExecutor', entry: 'index.html', files: { 'index.html': html }, snapshot: true, format: 'png', fullPage: true, values: ['window.appState'] });
  if (result.snapshot?.dataUrl) writeSnapshotPng(result.snapshot);
  writeJson('simulateRuntime-result.safe.json', { ok: result.ok, engine: result.engine, values: result.values, errors: result.errors, snapshot: result.snapshot });
  writeJson('snapshot.json', result.snapshot || null);
  writeText('snapshot.html', result.snapshot?.html || html);
  return result;
}

function runCommandStress() {
  const commands = [`node -e 'console.log(JSON.stringify({bh:"B\\"H",task:"one"}))'`, 'node -e "console.log(6*7)"', 'node --check AI_THOUGHTS/runtime-stress/local-action-sandbox/real-minimax-snapshot-test.mjs'];
  const results = commands.map(command => {
    const started = Date.now();
    const result = cp.spawnSync('bash', ['-lc', command], { cwd: repo, encoding: 'utf8', timeout: 30000 });
    return { command, exitCode: result.status, ms: Date.now() - started, stdout: result.stdout.trim(), stderr: result.stderr.trim() };
  });
  writeJson('command-stress.json', { total: results.length, passed: results.filter(r => r.exitCode === 0).length, failed: results.filter(r => r.exitCode !== 0).length, results });
  return results;
}

async function callMiniMax(snapshotResult) {
  if (!apiKey) return { skipped: true, reason: 'MINIMAX_API_KEY_missing' };
  const snapshot = snapshotResult.snapshot || {};
  if (!snapshot.dataUrl) return { skipped: true, reason: 'snapshot_dataUrl_missing' };
  const prompt = ['B"H. You are the Awtsmoos visual QA agent.', 'A simulateRuntime snapshot PNG is attached using the OpenAI-compatible image_url format accepted by MiniMax-M3.', 'Describe what you see, identify UI/code improvements, then propose a concise patch plan.', `Snapshot backend: ${snapshot.image?.backend || 'unknown'}`, 'Snapshot text:', snapshot.text || '', 'Snapshot values:', JSON.stringify(snapshot.values || {})].join('\n');
  const payload = { model, messages: [{ role: 'user', content: [{ type: 'text', text: prompt }, { type: 'image_url', image_url: { url: snapshot.dataUrl } }] }], stream: false, temperature: 0.2, max_tokens: 1200 };
  writeJson('minimax-request.redacted.json', { ...payload, messages: payload.messages.map(m => ({ ...m, content: m.content.map(p => p.type === 'image_url' ? { type: 'image_url', image_url: { url: '[omitted-data-url]' } } : p) })), note: 'Authorization header omitted/redacted.' });
  const response = await fetch(endpoint, { method: 'POST', headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
  const text = await response.text();
  writeText('minimax-response.raw.txt', text);
  let json = null; try { json = JSON.parse(text); } catch (_e) {}
  writeJson('minimax-response.json', json || { parseError: true, text });
  const answer = json?.choices?.[0]?.message?.content || text;
  writeText('minimax-answer.md', answer);
  return { ok: response.ok, status: response.status, model, answerLength: answer.length, responseFile: 'minimax-response.json', answerFile: 'minimax-answer.md' };
}

async function main() {
  const snapshotResult = await runSnapshot();
  const commandStress = runCommandStress();
  const minimax = await callMiniMax(snapshotResult);
  const snapshot = snapshotResult.snapshot || {};
  const summary = { BH: 'B"H', generatedAt: new Date().toISOString(), minimaxKeyPresent: Boolean(apiKey), minimax, simulateRuntimeOk: snapshotResult.ok !== false, snapshotExists: Boolean(snapshot), snapshotHasHtml: Boolean(snapshot.html), snapshotHasText: Boolean(snapshot.text), snapshotHasImageDataUrl: Boolean(snapshot.dataUrl), snapshotBackend: snapshot.image?.backend || null, fallbackReason: snapshot.image?.fallbackReason || null, renderedImagePath: snapshot.dataUrl ? rel(path.join(outDir, 'snapshot-render.png')) : null, commandStress: { total: commandStress.length, passed: commandStress.filter(r => r.exitCode === 0).length, failed: commandStress.filter(r => r.exitCode !== 0).length }, outputDir: rel(outDir) };
  writeJson('summary.json', summary);
  console.log(JSON.stringify(summary, null, 2));
  if (!summary.simulateRuntimeOk || !summary.snapshotExists || !summary.snapshotHasImageDataUrl || summary.commandStress.failed) process.exitCode = 1;
  if (summary.minimaxKeyPresent && !summary.minimax.ok) process.exitCode = 1;
}
main().catch(error => { writeJson('fatal-error.json', { message: error.message, stack: error.stack }); console.error(error.stack || error.message); process.exit(1); });
