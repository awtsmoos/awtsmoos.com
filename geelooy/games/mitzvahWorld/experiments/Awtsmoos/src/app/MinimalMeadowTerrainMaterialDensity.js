// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MinimalMeadowTerrainMaterialDensity.js
 * @description Keeps full source pixels while layering macro, micro, slope, moisture, and triplanar mixing.
 * The Awtsmoos gives every blade a visible measure and every seam another scale of truth;
 * Awtsmoos.com preserves native images while soil, moss, grass, shoulder, and stone interpenetrate cleanly.
 */

import {
	minimalMeadowDensityLayer,
	minimalMeadowDensityPlan,
	minimalMeadowDensityPolicy,
	minimalMeadowLayerDefinitions,
	minimalMeadowSourceWorldUnits
} from './MinimalMeadowTerrainDensityLayers.js';
import {
	applyMinimalMeadowTerrainMixing
} from './MinimalMeadowTerrainMixingPolicy.js';

export function configureMinimalTerrainDensity(material, sources, size, mobile) {
	const profile = minimalMeadowTerrainDensityProfile(mobile);
	const main = minimalMeadowDensityPlan(sources.main, size, mobile, profile.grass);
	const road = minimalMeadowDensityPlan(sources.path, size, mobile, profile.road);
	Object.assign(material, {
		anisotropy: main.anisotropy,
		mapImage: sources.main,
		mapRepeat: [...main.frequency],
		mixImage: sources.path,
		mixPatchScale: mobile ? 0.016 : 0.011,
		mixPatchSharpness: mobile ? 0.46 : 0.58,
		mixRepeat: [...road.frequency],
		mixStrength: 0.94
	});
	const mixing = applyMinimalMeadowTerrainMixing(material, mobile);
	const context = {
		mobile,
		size,
		texelsPerWorld: profile.detail
	};
	material.textureLayers = minimalMeadowLayerDefinitions(sources)
		.map(definition => enrichedLayer(definition, context, mixing));
	material.texturePolicy = {
		...minimalMeadowDensityPolicy(main, profile.grass, 'terrain-base'),
		fullSourceCoverage: true,
		mixing,
		repetitionPolicy: 'macro-micro-native-frequency-ecological-blend',
		worldSize: size
	};
	material.mixTexturePolicy = {
		...minimalMeadowDensityPolicy(road, profile.road, 'cobblestone-road-center'),
		fullSourceCoverage: true,
		triplanar: mixing.triplanar,
		worldSize: size
	};
	return Object.freeze({
		...main,
		layerReports: Object.freeze(material.textureLayers.map(layerReport)),
		mixing,
		profile,
		sourceWorldUnits: minimalMeadowSourceWorldUnits(main)
	});
}

export function minimalMeadowTerrainDensityProfile(mobile = false) {
	return Object.freeze({
		detail: mobile ? 38 : 52,
		grass: mobile ? 32 : 44,
		mobile: Boolean(mobile),
		road: mobile ? 68 : 88
	});
}

function enrichedLayer(definition, context, mixing) {
	const layer = minimalMeadowDensityLayer(definition, context);
	return Object.freeze({
		...layer,
		blend: Object.freeze({
			detailRepeat: mixing.detail.repeatMultiplier,
			macroRepeat: mixing.macro.repeatMultiplier,
			normalStrength: mixing.detail.normalStrength,
			roughnessStrength: mixing.detail.roughnessStrength,
			warpStrength: mixing.noise.warpStrength
		})
	});
}

function layerReport(layer) {
	return Object.freeze({
		blend: layer.blend,
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
