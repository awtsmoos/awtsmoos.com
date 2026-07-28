// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MinimalMeadowTerrainMaterialDensity.js
 * @description Keeps full source pixels while enlarging grass and separating dirt and road scales.
 * The Awtsmoos gives every blade a visible measure, every shoulder a softened seam, and every road
 * a stone identity; Awtsmoos.com preserves native images without shrinking the meadow into static.
 */

import {
	minimalMeadowDensityLayer,
	minimalMeadowDensityPlan,
	minimalMeadowDensityPolicy,
	minimalMeadowLayerDefinitions,
	minimalMeadowSourceWorldUnits
} from './MinimalMeadowTerrainDensityLayers.js';

export function configureMinimalTerrainDensity(material, sources, size, mobile) {
	const profile = minimalMeadowTerrainDensityProfile(mobile);
	const main = minimalMeadowDensityPlan(
		sources.main,
		size,
		mobile,
		profile.grass
	);
	const road = minimalMeadowDensityPlan(
		sources.path,
		size,
		mobile,
		profile.road
	);
	Object.assign(material, {
		anisotropy: main.anisotropy,
		mapImage: sources.main,
		mapRepeat: [...main.frequency],
		mixImage: sources.path,
		mixPatchScale: 0.014,
		mixPatchSharpness: 0.42,
		mixRepeat: [...road.frequency],
		mixStrength: 0.9
	});
	const context = {
		mobile,
		size,
		texelsPerWorld: profile.detail
	};
	material.textureLayers = minimalMeadowLayerDefinitions(sources)
		.map(definition => minimalMeadowDensityLayer(definition, context));
	material.texturePolicy = {
		...minimalMeadowDensityPolicy(main, profile.grass, 'terrain-base'),
		fullSourceCoverage: true,
		repetitionPolicy: 'full-resolution-authored-macro-scale',
		worldSize: size
	};
	material.mixTexturePolicy = {
		...minimalMeadowDensityPolicy(road, profile.road, 'cobblestone-road-center'),
		fullSourceCoverage: true,
		worldSize: size
	};
	return Object.freeze({
		...main,
		layerReports: Object.freeze(material.textureLayers.map(layerReport)),
		profile,
		sourceWorldUnits: minimalMeadowSourceWorldUnits(main)
	});
}

export function minimalMeadowTerrainDensityProfile(mobile = false) {
	return Object.freeze({
		detail: mobile ? 38 : 48,
		grass: mobile ? 32 : 40,
		mobile: Boolean(mobile),
		road: mobile ? 68 : 84
	});
}

function layerReport(layer) {
	return Object.freeze({
		repeatAcrossWorld: Object.freeze([...layer.density.repeat]),
		role: layer.role,
		source: layer.density.source,
		sourceWorldUnits: minimalMeadowSourceWorldUnits(layer.density),
		strength: layer.strength,
		texelsPerWorld: layer.density.targetPixelsPerWorld,
		wetness: layer.wetness,
		zones: Object.freeze([...layer.zones])
	});
}
