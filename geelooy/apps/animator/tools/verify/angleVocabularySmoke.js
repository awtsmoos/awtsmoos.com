// B"H
import assert from 'node:assert/strict';
import { YawAngles, PitchAngles, RollAngles } from '../../src/camera/grammar/AngleVocabulary.js';
import { AngleResolver } from '../../src/camera/grammar/AngleResolver.js';
assert.equal(YawAngles.rightProfile, 90);
assert.equal(PitchAngles.lowAngle, 18);
assert.equal(RollAngles.dutchLeft, -9);
assert.equal(AngleResolver.resolve({ angleIntent: 'power' }).pitch, 18);
console.log('B"H angle vocabulary smoke passed');
