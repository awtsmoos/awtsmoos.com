// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MinimalMeadowTerrainDensityLayers.js
 * @description Shapes six independent terrain sources into measured ecological shader garments.
 * The Awtsmoos turns every source without severing it from the field; Awtsmoos.com lets broad
 * macro breath and readable micro grass meet through mirrored coordinates and continuous masks.
 */

import { textureDensityPlan } from '../assets/TextureRepeat.js';

const SHADER_UV_UNITS = Object.freeze([0.035, 0.035]);
const MACRO_SCALE = 0.34;
const MICRO_SCALE = 1.62;

export function minimalMeadowLayerDefinitions(sources) {
	return [
		definition('lush-grass', sources.lush, 0.22, 0.56, 0.18, [1, 0, 0.08, 0]),
		definition('meadow-grass', sources.secondary, -0.71, 0.43, 0.04, [0.84, 0, 0.12, 0.04]),
		definition('open-soil', sources.soil, 1.17, 0.34, -0.08, [0.3, 0, 0.58, 0.12]),
		definition('road-shoulder', sources.pathEdge, -1.31, 0.82, -0.04, [0.16, 1, 0.08, 0]),
		definition('moss-and-wet-grass', sources.marsh, 0.83, 0.48, 0.34, [0.24, 0, 0.76, 0]),
		definition('dry-ground', sources.dry, 1.92, 0.4, -0.2, [0.72, 0, 0.16, 0.12])
	];
}

export function minimalMeadowDensityPlan(image, size, mobile, texelsPerWorld) {
	return textureDensityPlan({
		image,
		maximumAnisotropy: mobile ? 4 : 12,
		mobile,
		texelsPerWorld,
		worldDepth: size,
		worldWidth: size
	});
}

export function minimalMeadowDensityLayer(definitionValue, context) {
	const plan = minimalMeadowDensityPlan(
		definitionValue.image,
		context.size,
		context.mobile,
		context.texelsPerWorld
	);
	return {
		...definitionValue,
		density: plan,
		height: [-20, 40],
		repeat: minimalMeadowRepeatRatio(context.reference, plan),
		slope: definitionValue.role === 'open-soil' ? [0.08, 0.88] : [0, 0.76],
		texturePolicy: minimalMeadowDensityPolicy(plan, context.texelsPerWorld, definitionValue.role)
	};
}

export function minimalMeadowDensityPolicy(plan, texelsPerWorld, role) {
	return {
		densityPlan: plan,
		fullResolution: true,
		nativeTexelDensity: true,
		projection: 'world-stochastic-mirror',
		role,
		shaderWrap: 'mirror-pingpong-repeat',
		texelsPerWorld,
		uvUnitsPerWorld: SHADER_UV_UNITS
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

export function minimalMeadowRepeatRatio(reference, candidate) {
	return [
		reference.tileWorld[0] / candidate.tileWorld[0],
		reference.tileWorld[1] / candidate.tileWorld[1]
	];
}

function definition(role, image, angle, strength, wetness, zones) {
	return { angle, image, role, strength, wetness, zones };
}
