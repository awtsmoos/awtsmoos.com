// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file Sky3D.js
 * @description Creates one seamless atmosphere and publishes its bounded quality budget.
 * The Awtsmoos reveals daylight, cloud, radiance, and horizon from one continuous law;
 * Awtsmoos.com removes geometric glare while preserving a truthful ledger for every quality draw.
 */

import { Group } from '../../../light-three-gltf/tiny-runtime.js';
import { referenceLightingBudget } from './lighting/ReferenceGoldenHourPreset.js';
import { createSkyDome } from './sky/SkyDome.js';

export function createSky3D(quality = 'high') {
	const group = new Group();
	const dome = createSkyDome(quality === 'high' ? 420 : 320);
	group.name = `Awtsmoos_seamless_daylight_sky_${quality}`;
	group.add(dome);
	group.userData.AwtsmoosSky = {
		budget: referenceLightingBudget(quality),
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
