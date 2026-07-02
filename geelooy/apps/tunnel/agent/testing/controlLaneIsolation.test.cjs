// B"H
const assert = require('assert');
const P = require('../lib/runtime/priority.js');

const lanes = P.makeLaneState();
const limits = {
  MAX_INFLIGHT: 1,
  MAX_QUEUE: 1,
  CONTROL_QUEUE_LIMIT: 2,
  LANE_LIMITS: {
    p0_control: 1,
    p1_fs_light: 1,
    p2_chrome_light: 1,
    p3_heavy: 1,
    p4_bulk: 1
  }
};

lanes.p3_heavy.inflight = 1;
P.enqueue(lanes, { data: { payload: { kind: 'command', action: 'commandRun' } } });
P.enqueue(lanes, { data: { payload: { kind: 'command', action: 'commandStatus' } } });

assert.equal(P.canStartLane(lanes, 'p3_heavy', limits), false);
assert.equal(P.canStartLane(lanes, 'p0_control', limits), true);
assert.equal(P.canQueue(lanes, 'p3_heavy', limits), false);
assert.equal(P.canQueue(lanes, 'p0_control', limits), true);

console.log(JSON.stringify({ ok: true, suite: 'control-lane-isolation' }, null, 2));
