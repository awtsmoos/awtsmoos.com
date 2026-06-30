// B"H
const { spawnSync } = require('child_process');

const tests = [
  'tests/test-prompt-template.js',
  'tests/test-no-native-status.js',
  'tests/test-compiled-lm-head.js',
  'tests/test-execution-plan-compiler.js',
  'tests/test-native-builder-policy.js'
];

for (const test of tests) {
  const result = spawnSync(process.execPath, [test], { encoding: 'utf8' });
  process.stdout.write(result.stdout);
  process.stderr.write(result.stderr);
  if (result.status !== 0) process.exit(result.status || 1);
}

console.log(JSON.stringify({ ok: true, test: 'run-js-only-tests', count: tests.length }));
