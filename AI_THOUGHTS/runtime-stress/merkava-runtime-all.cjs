// B"H
const fs = require('fs');
const path = require('path');
const cp = require('child_process');
const OUT = 'AI_THOUGHTS/runtime-stress/full-runtime-matrix.json';
const JSONL = 'AI_THOUGHTS/runtime-stress/full-runtime-matrix.jsonl';
function dirs(root) {
  return fs.existsSync(root) ? fs.readdirSync(root, { withFileTypes: true }).filter(d => d.isDirectory()).map(d => path.join(root, d.name, 'index.html')).filter(fs.existsSync).sort() : [];
}
const targets = [...dirs('geelooy/apps'), ...dirs('geelooy/games')];
const rows = [];
fs.writeFileSync(JSONL, '');
for (const target of targets) {
  const started = Date.now();
  let row;
  try {
    const out = cp.execFileSync(process.execPath, ['AI_THOUGHTS/runtime-stress/merkava-runtime-child.cjs', target], { encoding: 'utf8', timeout: 16000, maxBuffer: 1024 * 1024 });
    row = JSON.parse(out.trim().split('\n').pop() || '{}');
  } catch (error) {
    row = { p: target, ok: false, engine: 'merkava', error: error.killed || error.signal ? 'child_timeout_or_signal_' + (error.signal || '') : error.message, stack: String(error.stderr || error.stdout || '').slice(0, 2000) };
  }
  row.ms = Date.now() - started;
  rows.push(row);
  fs.appendFileSync(JSONL, JSON.stringify(row) + '\n');
  const summary = { generatedAt: new Date().toISOString(), total: targets.length, count: rows.length, ok: rows.filter(r => r.ok).length, failed: rows.filter(r => !r.ok).length, rows };
  fs.writeFileSync(OUT, JSON.stringify(summary, null, 2));
  console.log(JSON.stringify({ count: rows.length, total: targets.length, p: row.p, ok: row.ok, error: row.error, ms: row.ms }));
}
