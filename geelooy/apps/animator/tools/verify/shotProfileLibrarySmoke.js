// B"H
import assert from 'node:assert/strict';
import { ShotProfileLibrary } from '../../src/camera/framing/ShotProfileLibrary.js';
assert.ok(ShotProfileLibrary.get('twoShot').zoom > 1);
assert.ok(ShotProfileLibrary.get('foodInsert').max > 1.6);
assert.ok(ShotProfileLibrary.get('establishingShot').room);
console.log('B"H shot profile library smoke passed');
