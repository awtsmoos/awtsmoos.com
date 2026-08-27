// B"H
import assert from 'node:assert/strict';
import { CinematicMobileShotDirector } from '../../src/director/camera/CinematicMobileShotDirector.js';
import { MobileCameraMercy } from '../../src/camera/MobileCameraMercy.js';

globalThis.window = { innerWidth: 360, innerHeight: 640, devicePixelRatio: 1 };
globalThis.devicePixelRatio = 1;
globalThis.innerWidth = 360;
globalThis.innerHeight = 640;

const state = {
  get(key) {
    if (key === 'scene') return { style: 'goal_board warm_study' };
    if (key === 'characters') return { a: {}, b: {} };
    return null;
  }
};
const ctx = {
  canvas: {
    width: 720,
    height: 1280,
    getBoundingClientRect() { return { width: 360, height: 640, left: 0, top: 0 }; }
  }
};

const cam = CinematicMobileShotDirector.resolve(ctx, state, { shot: 'group', zoom: 0.56, y: -120 });
assert.equal(cam.cinematicDirector, true);
assert.equal(cam.shot, 'mobileCinematicTwoShot');
assert.ok(cam.zoom >= 1.42, 'mobile two-shot must force readable subject scale');

const mercy = MobileCameraMercy.normalize({ mobile: true }, cam);
assert.ok(mercy.y < 108, 'cinematic y must not be crushed into legacy wide-shot range');
assert.ok(mercy.zoom >= 1.18 && mercy.zoom <= 1.62);
console.log('B"H - cinematic mobile shot director smoke passed');
