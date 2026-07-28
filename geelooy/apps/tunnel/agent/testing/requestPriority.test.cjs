// B"H
const assert = require('assert');
const P = require('../lib/runtime/priority.js');
const queue = [];
P.enqueue(queue, { data: { payload: { action: 'missionConversationStress' } } });
P.enqueue(queue, { data: { payload: { action: 'commandRun' } } });
P.enqueue(queue, { data: { payload: { action: 'commandStatus' } } });
P.enqueue(queue, { data: { payload: { action: 'commandJobOutputPage' } } });
P.enqueue(queue, { data: { payload: { action: 'list' } } });
assert.deepEqual(queue.map(P.actionOf), ['commandStatus', 'missionConversationStress', 'commandRun', 'commandJobOutputPage', 'list']);
assert.equal(P.laneForAction('commandStatus'), P.LANES.P0);
assert.equal(P.laneForAction('commandJobOutputPage'), P.LANES.P0_OBSERVE);
assert.equal(P.laneForAction('commandRun'), P.LANES.P3);
console.log('B"H request priority isolates control and observation from heavy work');
