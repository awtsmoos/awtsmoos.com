// B"H
import assert from 'node:assert/strict';
import { TargetFrameSolver } from '../../src/camera/framing/TargetFrameSolver.js';
import { MobileSafeFrameSolver } from '../../src/camera/framing/MobileSafeFrameSolver.js';
const targets = [
  { id: 'a', type: 'actor', position: { x: -80, y: 110 }, bounds: { x: -80, y: 110, w: 90, h: 210 } },
  { id: 'b', type: 'actor', position: { x: 80, y: 110 }, bounds: { x: 80, y: 110, w: 90, h: 210 } }
];
const cam = TargetFrameSolver.solve({ shotType: 'twoShot', targets });
assert.ok(Math.abs(cam.x) <= 30);
assert.ok(cam.zoom >= 0.74 && cam.zoom <= 1.22);
const safe = MobileSafeFrameSolver.solve({ x: 999, y: -999, zoom: 9, shotType: 'groupShot' }, { mobile: true });
assert.ok(safe.x <= 210 && safe.y >= 84 && safe.zoom <= 0.96);
console.log('B"H camera centered smoke passed');
