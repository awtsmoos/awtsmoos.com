// B"H
import assert from 'node:assert/strict';
import { CharacterStyleProfile } from '../../src/character/style/CharacterStyleProfile.js';
assert.ok(CharacterStyleProfile.get('soft').lineWeight > 2);
console.log('B"H character style smoke passed');
