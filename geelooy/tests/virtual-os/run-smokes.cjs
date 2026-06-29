// B"H
const { spawnSync } = require('child_process');
const path = require('path');

const root = path.resolve(__dirname, '../..');
const tests = [
  esm('tests/virtual-os/graph-browser-smoke.mjs'),
  esm('tests/virtual-os/vfs-mount-smoke.mjs'),
  cjs('tests/virtual-os/server-graph-smoke.cjs'),
  esm('tests/virtual-os/tunnel-handlers-smoke.mjs')
];

for (const test of tests) run(test);
console.log('B"H virtual OS smoke suite passed');

function esm(file) { return { file, args:['--no-warnings', file] }; }
function cjs(file) { return { file, args:[file] }; }
function run(test) {
  const result = spawnSync(process.execPath, test.args, { cwd:root, stdio:'inherit' });
  if (result.status !== 0) process.exit(result.status || 1);
}

/** B"H: the smoke runner uses stable Node flags and keeps output focused. */
