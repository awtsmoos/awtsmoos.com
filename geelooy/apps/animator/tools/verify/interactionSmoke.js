// B"H
import assert from 'node:assert/strict';
import { InteractionCompiler } from '../../src/director/actions/InteractionCompiler.js';

const events = InteractionCompiler.compile({ start: 0, end: 1, foodAction: { verb: 'bite', actor: 'kid', food: 'apple' } });
assert.equal(events.length, 2);
assert.ok(events.some(e => e.gesture === 'bite'));
console.log('B"H interaction smoke passed');
