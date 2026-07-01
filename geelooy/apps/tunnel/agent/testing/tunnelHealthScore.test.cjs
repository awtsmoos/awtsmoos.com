// B"H
const assert = require('assert');
const Health = require('../lib/runtime/health-score.js');
const now = Date.now();
const degraded = Health.compileHealth({
  now,
  websocketAgeMs: 180000,
  pid: 123,
  eventLoopLagMs: 5,
  workers: { active: { w1: { state:'running', heartbeatAt:new Date(now - 1000).toISOString() } } },
  lastSuccessfulActionAgeMs: 5000,
  journalWritable: true,
  localApiReachable: true
});
assert.notEqual(degraded.state, 'dead');
assert.equal(degraded.signals.commandWorkerHeartbeat, true);
const dead = Health.compileHealth({ now, websocketAgeMs: 600000, eventLoopLagMs: 9000, workers:{ active:{} }, journalWritable:false, localApiReachable:false });
assert.equal(dead.state, 'dead');
console.log('health score preserves degraded tunnel identity before dead verdict');
