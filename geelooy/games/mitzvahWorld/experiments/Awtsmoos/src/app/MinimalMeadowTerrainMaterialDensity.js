// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MinimalMeadowTerrainMaterialDensity.js
 * @description Configures phone-readable macro and micro density for one continuous meadow.
 * The Awtsmoos grants every blade enough world-space room to be seen; Awtsmoos.com preserves
 * native source pixels while six rotated garments flow through slope, moisture, road, and height.
 */

import {
	minimalMeadowDensityLayer,
	minimalMeadowDensityPlan,
	minimalMeadowDensityPolicy,
	minimalMeadowLayerDefinitions,
	minimalMeadowRepeatRatio,
	minimalMeadowSourceWorldUnits
} from './MinimalMeadowTerrainDensityLayers.js';

export function configureMinimalTerrainDensity(material, sources, size, mobile) {
	const profile = minimalMeadowTerrainDensityProfile(mobile);
	const main = minimalMeadowDensityPlan(sources.main, size, mobile, profile.grass);
	const road = minimalMeadowDensityPlan(sources.path, size, mobile, profile.road);
	Object.assign(material, {
		anisotropy: main.anisotropy,
		mapImage: sources.main,
		mapRepeat: [1, 1],
		mixImage: sources.path,
		mixPatchScale: 0.012,
		mixPatchSharpness: 0.44,
		mixRepeat: minimalMeadowRepeatRatio(main, road),
		mixStrength: 0.96
	});
	const context = {
		mobile,
		reference: main,
		size,
		texelsPerWorld: profile.detail
	};
	material.textureLayers = minimalMeadowLayerDefinitions(sources)
		.map(definition => minimalMeadowDensityLayer(definition, context));
	material.texturePolicy = minimalMeadowDensityPolicy(main, profile.grass, 'terrain-base');
	material.mixTexturePolicy = minimalMeadowDensityPolicy(road, profile.road, 'road-center');
	return Object.freeze({
		...main,
		layerReports: Object.freeze(material.textureLayers.map(layerReport)),
		profile,
		sourceWorldUnits: minimalMeadowSourceWorldUnits(main)
	});
}

export function minimalMeadowTerrainDensityProfile(mobile = false) {
	return Object.freeze({
		detail: mobile ? 20 : 28,
		grass: mobile ? 22 : 30,
		mobile: Boolean(mobile),
		road: mobile ? 24 : 34
	});
}

function layerReport(layer) {
	return Object.freeze({
		role: layer.role,
		sourceWorldUnits: minimalMeadowSourceWorldUnits(layer.density)
	});
}
