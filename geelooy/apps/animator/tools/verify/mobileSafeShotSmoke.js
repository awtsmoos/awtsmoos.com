// B"H
import assert from 'node:assert/strict';
import { MobileSafeFrameSolver } from '../../src/camera/framing/MobileSafeFrameSolver.js';
const cam=MobileSafeFrameSolver.solve({x:999,y:-999,zoom:9,shotType:'wideShot'},{mobile:true});
assert.ok(cam.x <= 280 && cam.y >= 82 && cam.zoom <= 1.28);
console.log('B"H mobile safe shot smoke passed');
