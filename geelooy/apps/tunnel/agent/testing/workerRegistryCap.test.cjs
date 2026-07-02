// B"H
const assert = require('assert');
const { createRegistry } = require('../lib/runtime/worker-registry.js');

const registry = createRegistry({ maxActive: 3, maxRecent: 2 });
for (let i = 0; i < 8; i++) {
  registry.registerWorker({
    workerId: 'worker_' + i,
    action: 'commandRun',
    startedAt: new Date(Date.now() + i).toISOString()
  });
}

const snap = registry.snapshot();
assert.equal(snap.activeTotal, 8);
assert.equal(snap.activeLimit, 3);
assert.equal(snap.activeTruncated, true);
assert.equal(Object.keys(snap.active).length, 3);

console.log(JSON.stringify({ ok: true, suite: 'worker-registry-cap' }, null, 2));
