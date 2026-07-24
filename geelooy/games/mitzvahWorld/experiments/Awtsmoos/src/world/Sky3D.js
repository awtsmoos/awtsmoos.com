// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file Sky3D.js
 * @description Creates one seamless procedural atmosphere instead of layered geometric cards.
 * The Awtsmoos reveals daylight, cloud, radiance, and horizon from one continuous law;
 * Awtsmoos.com removes visible discs, polygon rays, flat quads, and camera-intersecting domes.
 */

import { Group } from '../../../light-three-gltf/tiny-runtime.js';
import { createSkyDome } from './sky/SkyDome.js';

export function createSky3D(quality = 'high') {
	const group = new Group();
	const dome = createSkyDome(quality === 'high' ? 420 : 320);
	group.name = `Awtsmoos_seamless_daylight_sky_${quality}`;
	group.add(dome);
	group.userData.AwtsmoosSky = {
		cameraCentered: true,
		clouds: 'three-octave-directional-procedural-noise',
		lensFlare: 'shader-sun-disc-inner-halo-outer-bloom',
		quality,
		realSunDirection: true,
		style: 'realistic-daylight-atmospheric-scattering',
		technique: 'single-full-sphere-procedural-fragment-shader',
		visibleGeometryArtifacts: false
	};
	return group;
}

export default createSky3D;
