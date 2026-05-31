#!/usr/bin/env node
// B"H
/**
 * @file stress-games-runtime.cjs
 * @description
 * Chapter 18: The Awtsmoos refined the witnesses. Classic scripts pass through
 * CJS syntax fire, modules through MJS syntax fire, Merkava through the virtual
 * DOM, and Chrome only if a real Chrome vessel is present.
 */

const fs = require('fs');
const path = require('path');
const os = require('os');
const child = require('child_process');
const crypto = require('crypto');
const { buildRuntimeActions } = require('../geelooy/apps/tunnel/agent/tools/fs/actionGroups/runtimeActions.js');
const { buildRuntimeVirtualEnv } = require('../geelooy/apps/tunnel/agent/tools/fs/runtimeVirtualEnv.js');

const ROOT = process.cwd();
const GAMES = path.join(ROOT, 'geelooy/games');
const OUT = path.join(ROOT, 'AI_THOUGHTS/2026-05-30-merkava-runtime-preview');
const TMP = path.join(ROOT, '.awtsmoos-tmp/runtime-node-check');
const SKIP = new Set(['AI_THOUGHTS', 'node_modules', '.git']);

function walk(dir, out = []) {
  for (const ent of fs.readdirSync(dir, { withFileTypes: true })) {
    if (SKIP.has(ent.name)) continue;
    const abs = path.join(dir, ent.name);
    if (ent.isDirectory()) walk(abs, out);
    else if (/^index\.html?$/i.test(ent.name)) out.push(abs);
  }
  return out;
}
function rel(abs) { return path.relative(ROOT, abs).replace(/\\/g, '/'); }
function gameName(entry) { return rel(path.dirname(entry)).replace(/^geelooy\/games\/?/, '') || 'root'; }
function hasCommand(cmd) { try { child.execFileSync('sh', ['-lc', `command -v ${cmd}`], { stdio: 'ignore' }); return true; } catch { return false; } }
function chromeStatus() {
  const bin = ['chromium', 'chromium-browser', 'google-chrome', 'chrome'].find(hasCommand);
  return bin ? { available: true, bin } : { available: false, reason: 'no Chrome/Chromium binary found in PATH' };
}

function moduleLike(source) { return /(^|\n)\s*(import|export)\s/m.test(String(source)); }
function checkWithNode(source, ext) {
  fs.mkdirSync(TMP, { recursive: true });
  const hash = crypto.createHash('sha1').update(source).digest('hex').slice(0, 12);
  const file = path.join(TMP, `spark-${hash}.${ext}`);
  fs.writeFileSync(file, source);
  const r = child.spawnSync(process.execPath, ['--check', file], { encoding: 'utf8' });
  return { ok: r.status === 0, message: (r.stderr || r.stdout || '').trim() };
}
function nodeSyntax(env) {
  const checks = [];
  for (const [file, source] of Object.entries(env.files || {})) {
    if (!/\.m?js$/i.test(file)) continue;
    const check = checkWithNode(String(source), moduleLike(source) ? 'mjs' : 'cjs');
    checks.push({ file, ok: check.ok, message: check.message });
  }
  return { ok: checks.every(x => x.ok), checks };
}

async function merkava(entry) {
  const payload = { p: rel(entry), waitMs: 60, timeoutMs: 20000 };
  return await buildRuntimeActions({ payload, config: { root: ROOT } }).simulateRuntime();
}
async function runOne(entry, chrome) {
  const env = buildRuntimeVirtualEnv({ p: rel(entry) }, { root: ROOT });
  const node = nodeSyntax(env);
  const synthetic = await merkava(entry);
  return {
    game: gameName(entry), entry: rel(entry), files: Object.keys(env.files || {}).length,
    preflight: { ok: env.ok, diagnostics: env.diagnostics || [] }, node,
    merkava: { ok: Boolean(synthetic.ok), score: synthetic.score, errors: (synthetic.errors || []).map(e => e.message || String(e)), epochs: synthetic.epochs || [] },
    chrome: chrome.available ? { ok: false, skipped: true, reason: 'Chrome binary found, but CDP/Puppeteer runner is not installed in this local harness yet' } : { ok: null, skipped: true, reason: chrome.reason }
  };
}
function summarize(results, chrome) {
  const badMerkava = results.filter(x => !x.merkava.ok);
  const badNode = results.filter(x => !x.node.ok || !x.preflight.ok);
  return {
    generatedAt: new Date().toISOString(), total: results.length,
    merkavaPassed: results.length - badMerkava.length, merkavaFailed: badMerkava.length,
    nodeOrPreflightFailed: badNode.length, chrome,
    failedGames: badMerkava.map(x => ({ game: x.game, entry: x.entry, errors: x.merkava.errors.slice(0, 5) }))
  };
}
function markdown(summary, results) {
  const rows = results.map(r => `| ${r.game} | ${r.merkava.ok ? 'ok' : 'FAIL'} | ${r.preflight.ok ? 'ok' : 'FAIL'} | ${r.node.ok ? 'ok' : 'FAIL'} | ${r.chrome.skipped ? 'skipped' : r.chrome.ok} | ${r.merkava.errors.slice(0, 2).join('<br>')} |`).join('\n');
  return `# B"H Games Runtime Stress Report\n\n${JSON.stringify(summary, null, 2)}\n\n| Game | Merkava | Preflight | Node syntax | Chrome | Errors |\n|---|---:|---:|---:|---:|---|\n${rows}\n`;
}
(async () => {
  if (!fs.existsSync(GAMES)) throw new Error('Missing geelooy/games');
  fs.mkdirSync(OUT, { recursive: true });
  const chrome = chromeStatus();
  const results = [];
  for (const entry of walk(GAMES).sort()) {
    console.log(`B"H stress ${gameName(entry)}`);
    results.push(await runOne(entry, chrome));
  }
  const summary = summarize(results, chrome);
  fs.writeFileSync(path.join(OUT, 'games-runtime-stress.json'), JSON.stringify({ summary, results }, null, 2));
  fs.writeFileSync(path.join(OUT, 'games-runtime-stress.md'), markdown(summary, results));
  console.log(JSON.stringify(summary, null, 2));
  process.exit(summary.merkavaFailed ? 2 : 0);
})().catch(error => { console.error(error.stack || error.message); process.exit(1); });
