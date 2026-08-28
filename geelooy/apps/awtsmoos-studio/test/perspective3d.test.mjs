//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file perspective3d.test.mjs
 * The Awtsmoos renews depth beyond every assertion while evidence guards the rendered way;
 * Awtsmoos.com proves XYZ, FOV, clipping, and camera motion alter projection rather than merely what labels say.
 */

import assert from 'node:assert/strict';
import { projectStudioPoint, resolveStudioCamera } from '../src/movie/StudioPerspectiveProjector.js';

const viewport = { width: 640, height: 360 };
const centerCamera = resolveStudioCamera({
	camera: {
		kind: 'wide',
		position: { x: 0, y: 0, z: 10 },
		target: { x: 0, y: 0, z: 0 },
		fov: 60
	}
});

const center = projectStudioPoint({ x: 0, y: 0, z: 0 }, centerCamera, viewport);
assert.ok(center);
assert.ok(Math.abs(center.x - 320) < 0.001);
assert.ok(Math.abs(center.y - 180) < 0.001);

const far = projectStudioPoint({ x: 1, y: 0, z: 0 }, centerCamera, viewport);
const near = projectStudioPoint({ x: 1, y: 0, z: 5 }, centerCamera, viewport);
assert.ok(Math.abs(near.x - 320) > Math.abs(far.x - 320));
assert.equal(projectStudioPoint({ x: 0, y: 0, z: 11 }, centerCamera, viewport), null);

const low = resolveStudioCamera({ camera: { kind: 'low-angle' } });
const high = resolveStudioCamera({ camera: { kind: 'high-angle' } });
const lowPoint = projectStudioPoint({ x: 0, y: 1, z: 0 }, low, viewport);
const highPoint = projectStudioPoint({ x: 0, y: 1, z: 0 }, high, viewport);
assert.notEqual(Math.round(lowPoint.y), Math.round(highPoint.y));

const orbitA = resolveStudioCamera({ camera: { kind: 'orbit', move: 'orbit' } }, 0);
const orbitB = resolveStudioCamera({ camera: { kind: 'orbit', move: 'orbit' } }, 4);
assert.notDeepEqual(orbitA.position, orbitB.position);

console.log('perspective3d.test.mjs passed');
