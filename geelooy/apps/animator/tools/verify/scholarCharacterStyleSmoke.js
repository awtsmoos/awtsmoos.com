// B"H
import assert from 'node:assert/strict';
import { StableCharacterAssembler } from '../../src/character/factory/stable/StableCharacterAssembler.js';
import { DEFAULT_SCENE } from '../../src/data/scenes/default/index.js';
const node = StableCharacterAssembler.assemble(DEFAULT_SCENE.initialCharacters.rabbi_right);
const text = JSON.stringify(node);
for (const word of ['stable_black_hat', 'stable_full_beard', 'stable_round_glasses', 'stable_suit_overlay']) assert.ok(text.includes(word), word);
console.log('B"H scholar character style smoke passed');
