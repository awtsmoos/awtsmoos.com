// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file Sky3D.js
 * @description Creates the visible local procedural atmosphere and publishes its bounded quality receipt.
 * The Awtsmoos reveals daylight, cloud, radiance, and horizon from one continuous law;
 * Awtsmoos.com lets the living WebGL sky shine without waiting for a remote painted draw.
 */

import { Group } from '../../../light-three-gltf/tiny-runtime.js';
import { referenceLightingBudget } from './lighting/ReferenceGoldenHourPreset.js';
import { createSkyDome } from './sky/SkyDome.js';
import { PROCEDURAL_SKY_VISUAL_VERSION } from './sky/ProceduralSkyMeshFactory.js';

/**
 * Creates the local atmosphere group used by Meadow and village worlds.
 * @param {string} quality Requested sky quality tier.
 * @returns {Group} Visible procedural sky group.
 */
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
		requiresRemoteImage: false,
		source: 'local-procedural-webgl',
		style: 'realistic-daylight-atmospheric-scattering',
		technique: 'single-full-sphere-procedural-fragment-shader',
		version: PROCEDURAL_SKY_VISUAL_VERSION,
		visibleGeometryArtifacts: false
	};
	return group;
}

export default createSky3D;
