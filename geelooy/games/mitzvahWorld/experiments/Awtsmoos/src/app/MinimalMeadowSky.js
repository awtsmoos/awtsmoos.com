// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MinimalMeadowSky.js
 * @description Owns one complete procedural atmosphere and moves it only when the camera truly moves.
 * The Awtsmoos renews the ceiling wherever the traveler stands; Awtsmoos.com preserves the full
 * sphere, sun, and clouds while unchanged frames perform no redundant transform publication.
 */

import { createSky3D } from '../world/Sky3D.js?v=20260723-meadow-11';

export function installMinimalMeadowSky(scene, camera, quality = 'high') {
	const sky = createSky3D(quality);
	scene.add(sky);
	const state = { x: NaN, y: NaN, z: NaN };
	const update = () => centerSky(sky, camera, state);
	update();
	return {
		diagnostics: () => ({ ...sky.userData.AwtsmoosSky }),
		group: sky,
		update
	};
}

function centerSky(sky, camera, state) {
	const position = camera?.position || {};
	const x = Number(position.x) || 0;
	const y = Number(position.y) || 0;
	const z = Number(position.z) || 0;
	if (state.x === x && state.y === y && state.z === z) return false;
	state.x = x;
	state.y = y;
	state.z = z;
	sky.position.set(x, y, z);
	return true;
}
