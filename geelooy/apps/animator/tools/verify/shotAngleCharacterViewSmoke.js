// B"H
import assert from 'node:assert/strict';
import { CharacterViewAngleMapper } from '../../src/camera/angles/CharacterViewAngleMapper.js';
assert.equal(CharacterViewAngleMapper.view(0),'front');
assert.equal(CharacterViewAngleMapper.view(45),'threeQuarter');
assert.equal(CharacterViewAngleMapper.view(90),'side');
assert.equal(CharacterViewAngleMapper.view(180),'back');
console.log('B"H shot angle character view smoke passed');
