// B"H
const fs = require('fs');
const path = require('path');
const { pathToFileURL } = require('url');
const { loadConfig } = require('../../geelooy/apps/tunnel/agent/lib/config.js');
const { collectOptions } = require('../../geelooy/apps/tunnel/agent/tools/fs/actionGroups/runtimeActions.js');

const MATRIX = 'AI_THOUGHTS/runtime-stress/all-html-runtime-matrix.json';
const OUT = 'AI_THOUGHTS/runtime-stress/all-html-puppeteer-smoke.json';
const JSONL = 'AI_THOUGHTS/runtime-stress/all-html-puppeteer-smoke.jsonl';
const CAP_MS = Number(process.env.MERKAVA_PUPPETEER_SMOKE_MS || 35000);

function targets() { return JSON.parse(fs.readFileSync(MATRIX, 'utf8')).rows.filter(row => row.ok).map(row => row.p); }
function selected() { const args = process.argv.slice(2); if (args.length >= 2 && /^\d+$/.test(args[0])) return targets().slice(Number(args[0]), Number(args[0]) + Number(args[1])); return args.length ? args : targets(); }
function priorRows() { try { return JSON.parse(fs.readFileSync(OUT, 'utf8')).rows || []; } catch { return []; } }
function cap(promise, ms, stage) { return Promise.race([promise, new Promise(resolve => setTimeout(() => resolve({ __timeout: true, stage }), ms))]); }
function browserActions() { return [
  { action: 'waitForSelector', selector: 'body', timeoutMs: 250 },
  { action: 'waitForFunction', source: 'document && document.body && document.body.children.length >= 0', timeoutMs: 250 },
  { action: 'evaluate', source: '({ title: document.title, bodyChildren: document.body ? document.body.children.length : -1, buttons: document.querySelectorAll("button").length, inputs: document.querySelectorAll("input, textarea, select").length })' },
  { action: 'click', selector: 'body', continueOnError: true },
  { action: 'evaluate', source: '({ activeTag: document.activeElement ? document.activeElement.tagName : null, textSize: document.body ? document.body.textContent.length : 0 })' },
  { action: 'snapshot' }
]; }
async function runOne(service, config, p) {
  const started = Date.now();
  const base = { p, at: new Date().toISOString() };
  try {
    const options = await cap(collectOptions({ action: 'simulateRuntime', p, waitMs: 0, timeoutMs: CAP_MS }, config), 7000, 'collectOptions');
    if (options.__timeout) return { ...base, ok: false, error: 'timeout:' + options.stage, ms: Date.now() - started };
    options.waitMs = 0; options.timeoutMs = CAP_MS; options.browserActions = browserActions(); options.returnValues = ['document.title'];
    const result = await cap(service.simulateRuntime(options), CAP_MS, 'simulateRuntime');
    if (result.__timeout) return { ...base, ok: false, error: 'timeout:' + result.stage, ms: Date.now() - started };
    const log = result.interactionLog || [];
    const failedAction = log.find(row => row.ok === false && !row.continueOnError);
    return { ...base, ok: !!result.ok && !failedAction, error: result.error || failedAction?.error || null, ms: Date.now() - started, actionCount: log.length, actions: log.map(row => ({ action: row.action, ok: row.ok !== false, error: row.error || null })) };
  } catch (error) { return { ...base, ok: false, error: error.message, stack: error.stack, ms: Date.now() - started }; }
}
async function main() {
  const all = targets(); const todo = selected(); const rowsByPath = new Map(priorRows().map(row => [row.p, row]));
  const config = loadConfig(); const servicePath = path.resolve('geelooy/scripts/awtsmoos/MerkavaExecutor/merkava-service/index.js');
  const service = await import(pathToFileURL(servicePath).href + '?smoke=' + Date.now());
  if (!fs.existsSync(JSONL)) fs.writeFileSync(JSONL, '');
  for (const p of todo) {
    const row = await runOne(service, config, p); rowsByPath.set(p, row); fs.appendFileSync(JSONL, JSON.stringify(row) + '\n');
    const rows = all.map(p => rowsByPath.get(p)).filter(Boolean); const summary = { generatedAt: new Date().toISOString(), capMs: CAP_MS, total: all.length, count: rows.length, ok: rows.filter(row => row.ok).length, failed: rows.filter(row => !row.ok).length, rows };
    fs.writeFileSync(OUT, JSON.stringify(summary, null, 2)); console.log(JSON.stringify({ p: row.p, ok: row.ok, error: row.error, ms: row.ms }));
  }
}
main().catch(error => { console.error(error.stack || error.message); process.exit(1); });
