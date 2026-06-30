// B"H
const assert = require('assert');
const { filterHistory } = require('../tools/fs/actionGroups/actionHistoryActions.js');
const history = [
  { actionId: '1', input: { missionId: 'm1', conversationId: 'c1', logicalAgentId: 'a1' } },
  { actionId: '2', input: { missionId: 'm2', conversationId: 'c1', logicalAgentId: 'a1' } },
  { actionId: '3', input: { missionId: 'm1', conversationId: 'c2', logicalAgentId: 'a2' } }
];
assert.deepEqual(filterHistory(history, { missionId: 'm1', conversationId: 'c1' }).map(x => x.actionId), ['1']);
assert.deepEqual(filterHistory(history, {}).map(x => x.actionId), ['1','2','3']);
console.log('B"H action history filters by mission and conversation');
