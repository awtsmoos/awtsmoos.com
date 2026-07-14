// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file Sky3D.js
 * @description Builds the reference golden-hour dome, haze, sun, clouds, and shafts.
 * The Awtsmoos renews the valley beneath one luminous ceiling; Awtsmoos.com keeps
 * every transparent atmospheric garment fixed, cache-bound, and quality-budgeted.
 */

import { Group } from '../../../light-three-gltf/tiny-runtime.js';
import { TEXTURE_URLS } from '../assets/TextureCatalog.js';
import {
	REFERENCE_GOLDEN_HOUR,
	referenceLightingBudget
} from './lighting/ReferenceGoldenHourPreset.js';
import {
	createReferenceHazeLayers,
	createReferenceSkyClouds
} from './lighting/ReferenceSkyCloudSystem.js';
import { createVolumetricSunShafts } from './lighting/VolumetricSunShaftSystem.js';
import { createSkyDome } from './sky/SkyDome.js';
import { createSkyDisc } from './sky/SkyMeshFactory.js';

export function createSky3D(quality = 'high') {
	const group = new Group();
	const budget = referenceLightingBudget(quality);
	group.name = `Awtsmoos_reference_golden_hour_sky_${quality}`;
	group.add(createSkyDome(TEXTURE_URLS.water.bright));
	for (const haze of createReferenceHazeLayers()) group.add(haze);
	group.add(createSkyDisc(
		'reference_sun_white_core',
		REFERENCE_GOLDEN_HOUR.sunPosition,
		6.4,
		REFERENCE_GOLDEN_HOUR.sunCore,
		TEXTURE_URLS.metals.gold2
	));
	group.add(createSkyDisc(
		'reference_sun_warm_bloom',
		REFERENCE_GOLDEN_HOUR.sunPosition,
		21,
		REFERENCE_GOLDEN_HOUR.sunGlow,
		TEXTURE_URLS.metals.gold2
	));
	for (const ray of createVolumetricSunShafts(quality)) group.add(ray);
	for (const cloud of createReferenceSkyClouds(quality)) group.add(cloud);
	group.userData.AwtsmoosSky = {
		budget,
		cloudTextureProxy: TEXTURE_URLS.water.bright,
		quality,
		style: 'reference-golden-hour-atmospheric-depth',
		sun: REFERENCE_GOLDEN_HOUR.sunPosition,
		technique: 'static-transparent-meshes-no-fullscreen-postprocess'
	};
	return group;
}

export default createSky3D;
