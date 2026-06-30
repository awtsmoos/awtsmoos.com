// B"H
const assert = require('assert');
const fs = require('fs');
const os = require('os');
const path = require('path');
const { VERSION, compileExecutionPlan } = require('../compile/execution-plan-compiler.js');

assert.strictEqual(typeof compileExecutionPlan, 'function');
assert.strictEqual(VERSION, 'awtai-lowrss-execution-plan-v1');
const source = fs.readFileSync(path.join(__dirname, '../compile/execution-plan-compiler.js'), 'utf8');
assert(!source.includes('child_process'));
assert(!/\b(clang|gcc|node-gyp|cmake|npm install)\b/i.test(source));

const model = process.argv[2];
if (!model) {
  console.log(JSON.stringify({ ok: true, test: 'execution-plan-source-policy', modelParity: 'skipped' }));
  process.exit(0);
}

const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'awtai-plan-test-'));
try {
  const a = compileExecutionPlan(model, { dir });
  const b = compileExecutionPlan(model, { dir });
  assert.strictEqual(a.plan.cacheKey, b.plan.cacheKey);
  assert.strictEqual(a.plan.audit.externalCompilerInvoked, false);
  assert(a.plan.layers.length > 0);
  assert.strictEqual(a.plan.summary.missing.length, 0);
  assert(fs.existsSync(a.artifact));
  console.log(JSON.stringify({ ok: true, test: 'execution-plan-compiler',
    cacheKey: a.plan.cacheKey, layers: a.plan.layers.length,
    tensorsResolved: a.plan.summary.tensorsResolved }));
} finally {
  fs.rmSync(dir, { recursive: true, force: true });
}
