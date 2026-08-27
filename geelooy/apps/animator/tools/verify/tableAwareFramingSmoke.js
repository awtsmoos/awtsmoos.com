// B"H
import assert from 'node:assert/strict';
import { TargetFrameSolver } from '../../src/camera/framing/TargetFrameSolver.js';
const targets = [{ id: 'a', type: 'actor', raw: { hatType: 'blackHat' }, position: { x: -100, y: 0 }, bounds: { x: -120, y: -80, w: 90, h: 220 } }, { id: 'b', type: 'actor', raw: { hatType: 'blackHat' }, position: { x: 100, y: 0 }, bounds: { x: 80, y: -80, w: 90, h: 220 } }];
const cam = TargetFrameSolver.solve({ shotType: 'twoShot', targets });
assert.ok(Math.abs(cam.x) < 30);
assert.ok(cam.zoom >= .92 && cam.zoom <= 1.14);
assert.ok(cam.y >= 112 && cam.y <= 148);
console.log('B"H table aware framing smoke passed');
