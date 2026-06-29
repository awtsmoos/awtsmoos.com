// B"H
import { createRequire } from 'module';
import assert from 'assert/strict';
const require = createRequire(import.meta.url);
const Focus = require('../../mission/response/compact.js');
const Size = require('../../mission/response/size.js');
const out = Focus.compact({ ok:true, action:'missionReport', missionId:'m1', finalAnswerAllowed:false, mustContinue:true, mustCallNext:{ action:'missionDaemonTick', missionId:'m1' }, huge:'x'.repeat(50000), report:{ huge:'y'.repeat(50000) }, releaseCourt:{ ok:false, issues:['minimum_time_not_met'], explanation:'Release blocked.' } }, { action:'missionReport' });
assert.equal(out.responseShape, 'focused-mission-v4-minimal');
assert.equal(out.huge, undefined);
assert.equal(out.report, undefined);
assert.match(out.tunnelInstruction, /DO NOT FINALIZE/);
assert.match(out.tunnelInstruction, /CALL NEXT ACTION: missionDaemonTick/);
assert(Size.bytes(out) < 4096);
console.log(JSON.stringify({ ok:true, bytes:Size.bytes(out), instruction:out.tunnelInstruction.slice(0,60) }, null, 2));
