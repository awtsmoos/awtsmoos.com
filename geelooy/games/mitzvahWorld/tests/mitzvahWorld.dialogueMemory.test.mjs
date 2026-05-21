import assert from 'node:assert/strict';
import { chooseDialogueLine, rememberDialogue } from '../ckidsAwtsmoos/Olam/runtime/dialogue/DialogueMemoryRuntime.js';

const lines = [
  { id: 'default', text: 'Shalom.' },
  { id: 'wood_done', text: 'The wood has arrived.', requiresMemory: 'gatheredWood' },
  { id: 'road_open', text: 'The road breathes again.', requiresEvent: 'road_repaired' }
];

assert.equal(chooseDialogueLine(lines, {}).id, 'default');
assert.equal(chooseDialogueLine(lines, { memory: { gatheredWood: true } }).id, 'wood_done');
assert.equal(chooseDialogueLine(lines, { events: ['road_repaired'] }).id, 'road_open');
assert.deepEqual(rememberDialogue({}, 'gatheredWood'), { gatheredWood: true });
assert.throws(() => rememberDialogue({}, ''), /memory key is required/);

console.log('B"H dialogue memory passed');
