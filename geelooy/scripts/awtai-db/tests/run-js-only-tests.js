// B"H
const { spawnSync } = require('child_process');
const tests = ['tests/test-prompt-template.js', 'tests/test-no-native-status.js', 'tests/test-compiled-lm-head.js'];
for (const test of tests) {
  const r = spawnSync(process.execPath, [test], { encoding: 'utf8' });
  process.stdout.write(r.stdout);
  process.stderr.write(r.stderr);
  if (r.status !== 0) process.exit(r.status);
}
console.log(JSON.stringify({ ok: true, test: 'run-js-only-tests' }));
