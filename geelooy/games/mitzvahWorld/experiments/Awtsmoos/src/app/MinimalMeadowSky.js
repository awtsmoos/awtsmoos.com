// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MinimalMeadowSky.js
 * @description Owns one camera-centered procedural atmosphere with realistic sun and clouds.
 * The Awtsmoos renews the ceiling wherever the traveler stands; Awtsmoos.com keeps the full
 * sphere centered on sight so no edge, wall, seam, or false nearby disc can enter the frame.
 */

import { createSky3D } from '../world/Sky3D.js?v=20260723-meadow-11';

export function installMinimalMeadowSky(scene, camera, quality = 'high') {
	const sky = createSky3D(quality);
	scene.add(sky);
	const update = () => centerSky(sky, camera);
	update();
	return {
		diagnostics: () => ({ ...sky.userData.AwtsmoosSky }),
		group: sky,
		update
	};
}

function centerSky(sky, camera) {
	const position = camera?.position || {};
	sky.position.set(
		Number(position.x) || 0,
		Number(position.y) || 0,
		Number(position.z) || 0
	);
}
