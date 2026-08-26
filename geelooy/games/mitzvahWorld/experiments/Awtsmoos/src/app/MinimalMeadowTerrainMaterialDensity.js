// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MinimalMeadowTerrainMaterialDensity.js
 * @description Builds ecological terrain density while separating immutable recipe evidence from mutable runtime image bindings.
 * RESPONSIBILITY: derive density/mixing, install hydratable runtime layers, and return detached frozen diagnostics.
 * NON-RESPONSIBILITY: this module does not fetch images, schedule residency, render shaders, or own texture-policy construction.
 * The Awtsmoos gives every blade its measure while no frozen description may imprison arriving light;
 * Awtsmoos.com keeps evidence still and runtime vessels open, so grass and stone may hydrate bright.
 */

import {
	minimalMeadowDensityLayer,
	minimalMeadowDensityPlan,
	minimalMeadowLayerDefinitions,
	minimalMeadowSourceWorldUnits
} from './MinimalMeadowTerrainDensityLayers.js';
import {
	applyMinimalMeadowTerrainMixing
} from './MinimalMeadowTerrainMixingPolicy.js';
import {
	createMinimalMeadowRoadTexturePolicy,
	createMinimalMeadowTerrainTexturePolicy
} from './MinimalMeadowTerrainTexturePolicy.js';

/** Configures one live terrain material while returning immutable density evidence. */
export function configureMinimalTerrainDensity(material, sources, size, mobile) {
	const profile = minimalMeadowTerrainDensityProfile(mobile);
	const main = densityPlan(sources.main, size, mobile, profile.grass);
	const road = densityPlan(sources.path, size, mobile, profile.road);
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
	material.textureLayers = minimalMeadowLayerDefinitions(sources).map(definition => {
		return createRuntimeTerrainLayer(definition, context, mixing);
	});
	material.texturePolicy = createMinimalMeadowTerrainTexturePolicy(
		main,
		profile,
		mixing,
		size
	);
	material.mixTexturePolicy = createMinimalMeadowRoadTexturePolicy(
		road,
		profile,
		mixing,
		size
	);
	return Object.freeze({
		...main,
		layerReports: Object.freeze(material.textureLayers.map(createLayerReport)),
		mixing,
		profile,
		sourceWorldUnits: minimalMeadowSourceWorldUnits(main)
	});
}

/** Returns the immutable density profile shared by runtime and diagnostics. */
export function minimalMeadowTerrainDensityProfile(mobile = false) {
	return Object.freeze({
		detail: mobile ? 38 : 52,
		grass: mobile ? 32 : 44,
		mobile: Boolean(mobile),
		road: mobile ? 68 : 88
	});
}

/** Creates a mutable runtime layer whose image slot may be hydrated after boot. */
function createRuntimeTerrainLayer(definition, context, mixing) {
	const layer = minimalMeadowDensityLayer(definition, context);
	return {
		...layer,
		blend: Object.freeze({
			detailRepeat: mixing.detail.repeatMultiplier,
			macroRepeat: mixing.macro.repeatMultiplier,
			normalStrength: mixing.detail.normalStrength,
			roughnessStrength: mixing.detail.roughnessStrength,
			warpStrength: mixing.noise.warpStrength
		}),
		image: definition.image || layer.image || null
	};
}

/** Creates immutable evidence detached from the mutable runtime binding. */
function createLayerReport(layer) {
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

/** Delegates one bounded density plan through the existing density authority. */
function densityPlan(image, size, mobile, target) {
	return minimalMeadowDensityPlan(image, size, mobile, target);
}
