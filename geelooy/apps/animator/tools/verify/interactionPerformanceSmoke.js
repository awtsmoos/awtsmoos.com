// B"H
import assert from 'node:assert/strict';
import { InteractionCompiler } from '../../src/interactions/InteractionCompiler.js';
const ev = InteractionCompiler.compile({ start: 0, end: 1, interaction: { type: 'bite', actor: 'kid', objectId: 'apple' } });
assert.ok(ev.some(e => e.type === 'character'));
assert.ok(ev.some(e => e.type === 'prop'));
console.log('B"H interaction performance smoke passed');
