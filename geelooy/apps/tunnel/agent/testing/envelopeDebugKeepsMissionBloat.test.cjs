// B"H
const assert = require('assert');
const Env = require('../lib/runtime/envelope.js');
const out = Env.responseEnvelope(
  { id:'req-debug' },
  { action:'commandRun', responseMode:'debug', tunnelName:'t1' },
  { ok:true, action:'commandRun', requestAction:'commandRun', mustContinue:true, workQueue:{ kept:true } },
  Date.now(),
  () => ({ workers:{ active:{} } })
);
assert.equal(out.action, 'commandRun');
assert.equal(out.workQueue.kept, true);
assert.equal(out.responseShape, undefined);
console.log('debug envelope keeps full mission surface when requested');
