// B"H
const fs = require('fs');
const path = require('path');
const { handleFsAction } = require(process.cwd() + '/geelooy/apps/tunnel/agent/tools/fs/actions.js');

const OUT = 'AI_THOUGHTS/runtime-stress/merkava-matrix-results.json';
const LOG = 'AI_THOUGHTS/runtime-stress/merkava-matrix-results.jsonl';
const GLOBAL_ERRORS = [];
process.on('unhandledRejection', reason => {
  GLOBAL_ERRORS.push({ type: 'unhandledRejection', message: reason?.message || String(reason), stack: reason?.stack || '' });
});
process.on('uncaughtException', error => {
  GLOBAL_ERRORS.push({ type: 'uncaughtException', message: error?.message || String(error), stack: error?.stack || '' });
});

const roots = process.argv.slice(2);
const defaults = [
  'geelooy/apps/tunnel-control/index.html',
  'geelooy/apps/piano/index.html',
  'geelooy/apps/editor/index.html',
  'geelooy/apps/tunnel/index.html',
  'geelooy/games/Merkava/index.html',
  'geelooy/games/pong/index.html',
  'geelooy/games/tetris/index.html',
  'geelooy/games/chess/index.html',
  'geelooy/games/connect4/index.html'
];

function expand(input) {
  if (!input.length) return defaults;
  return input.flatMap(item => {
    if (fs.existsSync(item) && fs.statSync(item).isDirectory()) {
      return fs.readdirSync(item, { withFileTypes: true })
        .filter(d => d.isDirectory())
        .map(d => path.join(item, d.name, 'index.html'))
        .filter(fs.existsSync);
    }
    return [item];
  });
}

function timeout(promise, ms) {
  return Promise.race([
    promise,
    new Promise(resolve => setTimeout(() => resolve({ ok: false, error: 'matrix_timeout', timeoutMs: ms }), ms))
  ]);
}

function errorText(r) {
  const e = (r.errors || [])[0];
  return r.error || e?.message || null;
}

async function runOne(p) {
  const started = Date.now();
  const payload = {
    action: 'simulateRuntime',
    p,
    timeoutMs: 9000,
    waitMs: 120,
    returnValues: [
      'document.title',
      'document.body ? document.body.children.length : -1',
      'document.querySelectorAll("script").length'
    ]
  };
  const beforeGlobalErrors = GLOBAL_ERRORS.length;
  const r = await timeout(handleFsAction(payload, null), 14000);
  await new Promise(resolve => setTimeout(resolve, 20));
  const leaked = GLOBAL_ERRORS.slice(beforeGlobalErrors);
  return {
    at: new Date().toISOString(),
    p,
    ok: !!r.ok && leaked.length === 0,
    ms: Date.now() - started,
    engine: r.engine || 'merkava',
    error: errorText(r) || leaked[0]?.message || null,
    leakedErrors: leaked,
    stack: (r.errors || [])[0]?.stack?.split('\n').slice(0, 5).join('\n') || leaked[0]?.stack?.split('\n').slice(0, 5).join('\n') || null,
    values: r.values || r.result?.values || null,
    epochs: r.epochs || null
  };
}

(async () => {
  const targets = [...new Set(expand(roots))];
  const rows = [];
  fs.writeFileSync(LOG, '');
  for (const p of targets) {
    const row = await runOne(p);
    rows.push(row);
    fs.appendFileSync(LOG, JSON.stringify(row) + '\n');
    fs.writeFileSync(OUT, JSON.stringify({ generatedAt: new Date().toISOString(), total: targets.length, ok: rows.filter(r => r.ok).length, failed: rows.filter(r => !r.ok).length, rows }, null, 2));
    console.log(JSON.stringify({ p: row.p, ok: row.ok, ms: row.ms, error: row.error }));
  }
  console.log('FINAL ' + JSON.stringify({ out: OUT, total: targets.length, ok: rows.filter(r => r.ok).length, failed: rows.filter(r => !r.ok).length }));
})().catch(err => { console.error(err.stack || err.message); process.exit(1); });
