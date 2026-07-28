// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MinimalMeadowTerrainDensityLayers.js
 * @description Converts ecological sources into exact native-frequency shader layer records.
 * The Awtsmoos clothes every source at its truthful scale; Awtsmoos.com carries real pixels,
 * world frequency, slope, height, and ecological authorship without arbitrary reference ratios.
 */

import {
	minimalMeadowNativeFrequency
} from './MinimalMeadowTerrainNativeFrequency.js';

export {
	minimalMeadowLayerDefinitions
} from './MinimalMeadowTerrainEcology.js';

const MACRO_SCALE = 0.28;
const MICRO_SCALE = 1.68;

export function minimalMeadowDensityPlan(
	image,
	size,
	mobile,
	texelsPerWorld
) {
	return minimalMeadowNativeFrequency(
		image,
		size,
		texelsPerWorld,
		mobile
	);
}

export function minimalMeadowDensityLayer(definition, context) {
	const plan = minimalMeadowDensityPlan(
		definition.image,
		context.size,
		context.mobile,
		context.texelsPerWorld
	);
	return {
		...definition,
		density: plan,
		height: [-20, 40],
		repeat: [...plan.frequency],
		slope: definition.role === 'open-soil'
			? [0.05, 0.92]
			: [0, 0.82],
		texturePolicy: minimalMeadowDensityPolicy(
			plan,
			context.texelsPerWorld,
			definition.role
		)
	};
}

export function minimalMeadowDensityPolicy(plan, texelsPerWorld, role) {
	return {
		densityPlan: plan,
		exactFractionalRepeat: true,
		fullResolution: true,
		nativeTexelDensity: true,
		projection: 'world-native-frequency-mirror',
		repeatAcrossWorld: [...plan.repeat],
		role,
		shaderWrap: 'mirror-pingpong-repeat',
		texelsPerWorld,
		uvUnitsPerWorld: [...plan.frequency]
	};
}

export function minimalMeadowSourceWorldUnits(plan) {
	const tileWorld = plan.tileWorld.map(Number);
	return Object.freeze({
		macro: Object.freeze(tileWorld.map(value => value / MACRO_SCALE)),
		micro: Object.freeze(tileWorld.map(value => value / MICRO_SCALE)),
		tileWorld: Object.freeze(tileWorld)
	});
}

export function minimalMeadowRepeatRatio(_reference, candidate) {
	return [...candidate.frequency];
}
