// B"H
const assert = require('assert');
const Loop = require('../lib/runtime/continuation-loop.js');
(async () => {
  let calls = 0;
  const first = { finalAnswerAllowed:false, userVisibleAnswerBlocked:true, nextRequiredToolCall:{ action:'missionStep', missionId:'m1' }, continuationToken:'t' };
  const out = await Loop.run({ result:first, payload:{ action:'commandRun', autoContinuationBudget:3 }, normalize:p=>p.kind, dispatch:async () => (++calls === 1 ? { finalAnswerAllowed:false, userVisibleAnswerBlocked:true, nextRequiredToolCall:{ action:'missionStep2', missionId:'m1' } } : { ok:true, finalAnswerAllowed:true }) });
  assert.equal(calls, 2);
  assert.equal(out.finalAnswerAllowed, true);
  assert.equal(out.autoContinuationSteps, 2);
  assert.equal(Loop.allowed({ action:'write' }), false);
  console.log(JSON.stringify({ ok:true, suite:'continuation-loop' }, null, 2));
})().catch(e => { console.error(e); process.exit(1); });
