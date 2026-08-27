// B"H
import assert from 'node:assert/strict';
import { ShotVocabulary } from '../../src/camera/grammar/ShotVocabulary.js';
import { ShotAliases } from '../../src/camera/grammar/ShotAliases.js';
import { ALL_SHOT_TYPE_NAMES } from '../../src/camera/grammar/ShotTypeNames.js';
assert.ok(ALL_SHOT_TYPE_NAMES.length >= 72);
assert.equal(ShotAliases.resolve('cu'), 'closeUp');
assert.ok(ShotVocabulary.get('overTheShoulder').defaultZoom > 1);
console.log('B"H shot vocabulary smoke passed');
