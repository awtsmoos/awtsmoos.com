// B"H
const assert = require('assert');
const fs = require('fs');
const path = require('path');

const main = fs.readFileSync(path.resolve(__dirname, '../main.js'), 'utf8');
assert(main.includes('function scheduleDrain()'), 'main must expose a scheduled drain gate');
assert(main.includes('setImmediate(drainQueue)'), 'drain must yield through setImmediate');
assert(!main.includes('for (let lane; (lane = nextLane());)'), 'tight drain loop must not return');
assert(main.includes('if (nextLane()) scheduleDrain();'), 'drain should continue only by scheduling the next tick');
assert(main.includes('Lag.createLagMonitor'), 'main must use rolling lag monitor');
console.log(JSON.stringify({ ok: true, suite: 'queue-drain-yield' }, null, 2));
