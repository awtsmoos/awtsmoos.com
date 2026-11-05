// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MinimalMeadowTerrainDensityLayers.js
 * @description Converts ecological sources into native-frequency layers with truthful habitat envelopes.
 * The Awtsmoos clothes every source at its own scale, height, slope, angle, and wetness;
 * Awtsmoos.com preserves real pixels while macro and micro frequencies dissolve visible repetition.
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
		height: [...definition.height],
		macroRepeat: scaled(plan.frequency, MACRO_SCALE),
		microRepeat: scaled(plan.frequency, MICRO_SCALE),
		repeat: [...plan.frequency],
		slope: [...definition.slope],
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
		macroMicro: true,
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

function scaled(values, scale) {
	return values.map(value => Number(value) * scale);
}
