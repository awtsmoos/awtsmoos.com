import assert from 'node:assert/strict';
import { QuestStateMachine } from '../ckidsAwtsmoos/Olam/runtime/quests/QuestStateMachine.js';

const quest = new QuestStateMachine({
  id: 'gather_emerald_wood',
  objectives: [{ id: 'wood', kind: 'collect', target: 'Wood', amount: 3 }]
});

assert.equal(quest.snapshot().status, 'active');
assert.equal(quest.apply({ kind: 'collect', target: 'Stone' }).status, 'active');
assert.equal(quest.apply({ kind: 'collect', target: 'Wood', amount: 2 }).progress.wood, 2);
assert.equal(quest.apply({ kind: 'collect', target: 'Wood' }).status, 'completed');
assert.equal(quest.apply({ kind: 'collect', target: 'Wood' }).progress.wood, 3);
assert.throws(() => new QuestStateMachine({}), /id is required/);

console.log('B"H quest state passed');
