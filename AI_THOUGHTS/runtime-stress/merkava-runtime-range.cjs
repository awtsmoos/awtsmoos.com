// B"H
const fs = require('fs');
const path = require('path');
const cp = require('child_process');
const start = Number(process.argv[2] || 0);
const take = Number(process.argv[3] || 8);
const OUT = 'AI_THOUGHTS/runtime-stress/full-runtime-matrix.json';
const JSONL = 'AI_THOUGHTS/runtime-stress/full-runtime-matrix.jsonl';
function dirs(root) {
  return fs.existsSync(root) ? fs.readdirSync(root, { withFileTypes: true }).filter(d => d.isDirectory()).map(d => path.join(root, d.name, 'index.html')).filter(fs.existsSync).sort() : [];
}
function prior() {
  try { return JSON.parse(fs.readFileSync(OUT, 'utf8')).rows || []; } catch { return []; }
}
const targets = [...dirs('geelooy/apps'), ...dirs('geelooy/games')];
const byPath = new Map(prior().filter(r => r && r.p).map(r => [r.p, r]));
for (const target of targets.slice(start, start + take)) {
  const started = Date.now();
  let row;
  try {
    const out = cp.execFileSync(process.execPath, ['AI_THOUGHTS/runtime-stress/merkava-runtime-child.cjs', target], { encoding: 'utf8', timeout: 18000, maxBuffer: 1024 * 1024 });
    row = JSON.parse(out.trim().split('\n').pop() || '{}');
  } catch (error) {
    row = { p: target, ok: false, engine: 'merkava', error: error.signal ? 'child_signal_' + error.signal : error.message, stack: String(error.stderr || error.stdout || '').slice(0, 2000) };
  }
  row.p = row.p || target;
  row.ms = Date.now() - started;
  byPath.set(target, row);
  fs.appendFileSync(JSONL, JSON.stringify(row) + '\n');
  const rows = targets.map(p => byPath.get(p)).filter(Boolean);
  fs.writeFileSync(OUT, JSON.stringify({ generatedAt: new Date().toISOString(), total: targets.length, count: rows.length, ok: rows.filter(r => r.ok).length, failed: rows.filter(r => !r.ok).length, rows }, null, 2));
  console.log(JSON.stringify({ start, take, p: row.p, ok: row.ok, error: row.error, ms: row.ms }));
}
