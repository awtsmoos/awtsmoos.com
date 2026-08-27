// B"H
import assert from 'node:assert/strict';
import { CameraRigRegistry } from '../../src/camera/core/CameraRigRegistry.js';
import { MobileCameraMercy } from '../../src/camera/MobileCameraMercy.js';
import { CARTOON_GENERATOR_ROADMAP } from '../../src/generator/CartoonGeneratorRoadmap.js';

const registry = new CameraRigRegistry({
  cameras: [{ id: 'wide_intro', type: 'wide' }, { id: 'close_face', framing: 'close' }],
  characters: {}
});

assert.equal(registry.get('wide_intro').renderDetailMode, 'wide');
assert.equal(registry.get('close_face').renderDetailMode, 'closeup');
assert.equal(registry.get('missing').id, 'group');

const mobile = MobileCameraMercy.normalize({ mobile: true }, { cameraId: 'wide_intro' });
assert.ok(Number.isFinite(mobile.zoom));
assert.ok(mobile.zoom >= 0.48 && mobile.zoom <= 0.82);
assert.ok(CARTOON_GENERATOR_ROADMAP.defaultDurationMs >= 2000);
console.log('B"H camera registry smoke passed');
