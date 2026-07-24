// B"H
const assert = require('assert');
const Env = require('../lib/runtime/envelope.js');
const out = Env.responseEnvelope(
  { id:'req1' },
  { action:'commandRun', responseMode:'compact', tunnelName:'t1' },
  {
    ok:true,
    action:'commandRun',
    requestAction:'commandRun',
    summary:'Started worker.',
    finalAnswerAllowed:false,
    mustContinue:true,
    multipleChoiceSelfInterrogation:{ giant:true },
    continuationPressure:{ releaseBlockedBecause:'unfinished verification' },
    workQueue:{ huge:true },
    nextRequiredToolCall:{ action:'commandJobStatus', jobId:'cmd1' }
  },
  Date.now(),
  () => ({ workers:{ active:{} } })
);
assert.equal(out.action, 'commandRun');
assert.equal(out.responseShape, 'compact-envelope-v1');
assert.equal(out.mission.active, true);
assert.equal(out.mission.nextRequiredToolCall.action, 'commandJobStatus');
assert.equal(out.multipleChoiceSelfInterrogation, undefined);
assert.equal(out.continuationPressure, undefined);
assert.equal(out.workQueue, undefined);
console.log('compact envelope mode reduces mission bloat and preserves action identity');
