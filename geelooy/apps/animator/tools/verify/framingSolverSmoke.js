// B"H
import assert from 'node:assert/strict';
import { TargetFrameSolver } from '../../src/camera/framing/TargetFrameSolver.js';
const cam=TargetFrameSolver.solve({shotType:'twoShot',targets:[{position:{x:-50,y:110},bounds:{x:-50,y:110,w:80,h:200}},{position:{x:50,y:110},bounds:{x:50,y:110,w:80,h:200}}]});
assert.ok(cam.zoom >= .5 && cam.zoom <= 2.05);
assert.ok(cam.y >= 72 && cam.y <= 182);
console.log('B"H framing solver smoke passed');
