// B"H
const assert = require('assert');
const P = require('../lib/runtime/priority.js');
const queue = [];
P.enqueue(queue, { data: { payload: { action: 'missionConversationStress' } } });
P.enqueue(queue, { data: { payload: { action: 'commandRun' } } });
P.enqueue(queue, { data: { payload: { action: 'commandStatus' } } });
P.enqueue(queue, { data: { payload: { action: 'commandJobOutputPage' } } });
P.enqueue(queue, { data: { payload: { action: 'list' } } });
assert.deepEqual(queue.map(P.actionOf), ['commandStatus', 'commandJobOutputPage', 'missionConversationStress', 'commandRun', 'list']);
console.log('B"H request priority keeps polling ahead of heavy work');
