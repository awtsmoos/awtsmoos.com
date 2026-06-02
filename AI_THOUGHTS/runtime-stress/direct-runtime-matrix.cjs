// B"H
/**
 * Direct Merkava runtime matrix.
 *
 * Chapter 98: The Test Vessel Stopped Being Crueler Than The Browser.
 *
 * Some real games boot in more than seven seconds on the phone tunnel, yet
 * return cleanly through simulateRuntime. The matrix therefore uses a measured
 * 15s runtime cap while still writing after every row so no timeout can hide
 * the path of the journey.
 */
const fs = require('fs');
const path = require('path');
const { pathToFileURL } = require('url');
const { loadConfig } = require('../../geelooy/apps/tunnel/agent/lib/config.js');
const { collectOptions } = require('../../geelooy/apps/tunnel/agent/tools/fs/actionGroups/runtimeActions.js');

const OUT = 'AI_THOUGHTS/runtime-stress/direct-runtime-matrix.json';
const JSONL = 'AI_THOUGHTS/runtime-stress/direct-runtime-matrix.jsonl';
const COLLECT_CAP_MS = Number(process.env.MERKAVA_MATRIX_COLLECT_MS || 7000);
const RUNTIME_CAP_MS = Number(process.env.MERKAVA_MATRIX_RUNTIME_MS || 15000);

function dirs(root) {
  return fs.existsSync(root)
    ? fs.readdirSync(root, { withFileTypes: true })
      .filter(d => d.isDirectory())
      .map(d => path.join(root, d.name, 'index.html'))
      .filter(fs.existsSync)
      .sort()
    : [];
}

function allTargets() {
  return [...dirs('geelooy/apps'), ...dirs('geelooy/games')];
}

function selectedTargets() {
  const args = process.argv.slice(2);
  if (args.length >= 2 && /^\d+$/.test(args[0])) {
    return allTargets().slice(Number(args[0]), Number(args[0]) + Number(args[1]));
  }
  return args.length ? args : allTargets();
}

function priorRows() {
  try {
    return JSON.parse(fs.readFileSync(OUT, 'utf8')).rows || [];
  } catch (_) {
    return [];
  }
}

function cap(promise, ms, stage) {
  return Promise.race([
    promise,
    new Promise(resolve => setTimeout(() => resolve({ __timeout: true, stage, ms }), ms))
  ]);
}

async function runOne(service, config, target) {
  const started = Date.now();
  const base = { p: target, at: new Date().toISOString() };
  try {
    const options = await cap(
      collectOptions({ action: 'simulateRuntime', p: target, waitMs: 0, timeoutMs: RUNTIME_CAP_MS }, config),
      COLLECT_CAP_MS,
      'collectOptions'
    );
    if (options.__timeout) return { ...base, ok: false, error: 'timeout:' + options.stage, ms: Date.now() - started };

    options.waitMs = 0;
    options.timeoutMs = RUNTIME_CAP_MS;
    const result = await cap(service.simulateRuntime(options), RUNTIME_CAP_MS, 'simulateRuntime');
    if (result.__timeout) {
      return {
        ...base,
        ok: false,
        error: 'timeout:' + result.stage,
        fileCount: Object.keys(options.files || {}).length,
        ms: Date.now() - started
      };
    }

    const err = (result.errors || [])[0];
    return {
      ...base,
      ok: !!result.ok,
      engine: result.engine || 'merkava',
      error: result.error || err?.message || null,
      stack: err?.stack ? String(err.stack).split('\n').slice(0, 5).join('\n') : null,
      fileCount: Object.keys(options.files || {}).length,
      values: result.values || {},
      ms: Date.now() - started
    };
  } catch (error) {
    return {
      ...base,
      ok: false,
      error: error.message,
      stack: error.stack ? String(error.stack).split('\n').slice(0, 8).join('\n') : null,
      ms: Date.now() - started
    };
  }
}

async function main() {
  const all = allTargets();
  const targets = selectedTargets();
  const rowsByPath = new Map(priorRows().filter(x => x && x.p).map(x => [x.p, x]));
  const config = loadConfig();
  const servicePath = path.resolve('geelooy/scripts/awtsmoos/MerkavaExecutor/merkava-service/index.js');
  const service = await import(pathToFileURL(servicePath).href + '?matrix=' + Date.now());
  if (!fs.existsSync(JSONL)) fs.writeFileSync(JSONL, '');

  for (const target of targets) {
    const row = await runOne(service, config, target);
    rowsByPath.set(target, row);
    fs.appendFileSync(JSONL, JSON.stringify(row) + '\n');
    const rows = all.map(p => rowsByPath.get(p)).filter(Boolean);
    const summary = {
      generatedAt: new Date().toISOString(),
      caps: { collectMs: COLLECT_CAP_MS, runtimeMs: RUNTIME_CAP_MS },
      total: all.length,
      count: rows.length,
      ok: rows.filter(r => r.ok).length,
      failed: rows.filter(r => !r.ok).length,
      rows
    };
    fs.writeFileSync(OUT, JSON.stringify(summary, null, 2));
    console.log(JSON.stringify({ p: row.p, ok: row.ok, error: row.error, ms: row.ms, fileCount: row.fileCount }));
  }
}

main().catch(error => {
  console.error(error.stack || error.message);
  process.exit(1);
});
