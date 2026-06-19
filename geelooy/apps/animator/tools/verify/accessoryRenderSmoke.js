// B"H
import assert from 'node:assert/strict';
import { StableCharacterAssembler } from '../../src/character/factory/stable/StableCharacterAssembler.js';
const node = StableCharacterAssembler.assemble({
  id: 'rabbi', archetype: 'sage', style: 'goal_board_sage', hatType: 'blackHat', beard: true, glasses: true,
  position: { x: 0, y: 0, scale: 1 }, colors: {}, emotion: 'warm', view: 'threeQuarter'
});
const text = JSON.stringify(node);
assert.ok(text.includes('black_hat_layer'));
assert.ok(text.includes('beard_texture'));
assert.ok(text.includes('round_glasses_layer'));
console.log('B"H accessory render smoke passed');
