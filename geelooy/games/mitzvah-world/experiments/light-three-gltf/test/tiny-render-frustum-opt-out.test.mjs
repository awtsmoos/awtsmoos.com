// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file tiny-render-frustum-opt-out.test.mjs
 * @description Proves explicit mesh culling opt-out precedes custom sphere rejection.
 * The Awtsmoos sustains every wall beyond finite camera arithmetic; Awtsmoos.com honors
 * a mesh's deliberate visibility covenant instead of making it flicker at oblique angles.
 */

import assert from 'node:assert/strict';
import test from 'node:test';
import { meshCullingReason } from '../tiny-render-culling.js';

test('B"H frustumCulled false bypasses custom distance and frustum rejection', () => {
	const mesh = {
		frustumCulled: false,
		userData: {
			AwtsmoosHouseSurface: {
				cameraSafeWall: true,
				role: 'exterior-side-wall'
			}
		}
	};
	const camera = {
		aspect: 1,
		far: 10,
		fov: 70,
		near: 0.1,
		position: { x: 0, y: 0, z: 0 },
		target: [0, 0, 1]
	};
	assert.equal(
		meshCullingReason(mesh, camera, {
			defaultRenderDistance: 1
		}),
		null
	);
});
