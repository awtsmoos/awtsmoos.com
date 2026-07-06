// B"H
const assert = require('assert');
const { stats } = require('../main.js');

const compact = stats({ workers: true });
assert.strictEqual(typeof compact.controlQueueLimit, 'number', 'queue stats must expose control queue reserve');
assert.strictEqual(typeof compact.workers.activeTotal, 'number', 'worker stats must expose active count');
assert.strictEqual(typeof compact.workers.recentCompleted, 'number', 'worker stats must expose recent completion count');
assert(Object.keys(compact.workers.active || {}).length <= 3, 'detailed active worker snapshots must stay capped');
assert((compact.workers.recent || []).length <= 2, 'detailed recent worker snapshots must stay capped');
assert(JSON.stringify(compact).length < 20000, 'queue stats must remain compact enough for status responses');

console.log(JSON.stringify({ ok: true, suite: 'queue-stats-compact' }, null, 2));
