// B"H
import assert from 'node:assert/strict';
import { SpeechProcessor } from '../../src/core/app/director/logic/SpeechProcessor.js';
import { CharacterProcessor } from '../../src/core/app/director/logic/CharacterProcessor.js';
const state = { value: { characters: { kid: { id: 'kid', expressionProfile: 'bright_child', position: {}, emotion: 'curious' } } }, get(k) { return this.value[k]; }, set(k, v) { this.value[k] = v; } };
CharacterProcessor.process(state, { id: 'kid', gesture: 'listen', start: 0, end: 1000 }, 0.2, 200);
SpeechProcessor.process(state, { id: 'kid', speech: 'This apple looks amazing!', start: 0, end: 1000, lookAt: 'apple' }, 0.4);
assert.ok(state.value.characters.kid.facePose);
assert.ok(state.value.characters.kid.performancePose);
assert.equal(state.value.characters.kid.attentionTarget.id, 'apple');
console.log('B"H healthy lunch performance smoke passed');
