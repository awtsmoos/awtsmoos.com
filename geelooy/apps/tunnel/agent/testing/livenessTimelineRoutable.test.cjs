// B"H
const assert = require('assert');
const { statusFromCircuit } = require('../lib/runtime/liveness-status.js');
const status = statusFromCircuit({ level:'panic', liveness:{ recentSuccess:true, freshWorker:false, canRoute:true, saturated:false } });
assert.equal(status.isAlive, true);
assert.equal(status.state, 'lagging_but_routable');
assert.equal(status.reason, 'recent_success_or_fresh_worker_proves_route');
console.log(JSON.stringify({ ok:true, suite:'livenessTimelineRoutable', status }, null, 2));
