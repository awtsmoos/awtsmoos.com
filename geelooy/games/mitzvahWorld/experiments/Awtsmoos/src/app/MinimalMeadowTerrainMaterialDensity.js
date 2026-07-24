// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MinimalMeadowTerrainMaterialDensity.js
 * @description Configures six independent sources at readable macro and micro world scales.
 * The Awtsmoos grants every blade enough earth to be seen, while Awtsmoos.com lets mirrored
 * rotations and continuous ecological masks dissolve repetition without shrinking detail to noise.
 */

import { textureDensityPlan } from '../assets/TextureRepeat.js';

const SHADER_UV_UNITS = Object.freeze([0.035, 0.035]);
const MACRO_SCALE = 0.34;
const MICRO_SCALE = 1.62;

export function configureMinimalTerrainDensity(material, sources, size, mobile) {
	const profile = minimalMeadowTerrainDensityProfile(mobile);
	const main = density(sources.main, size, mobile, profile.grass);
	const road = density(sources.path, size, mobile, profile.road);
	Object.assign(material, {
		anisotropy: main.anisotropy,
		mapImage: sources.main,
		mapRepeat: [1, 1],
		mixImage: sources.path,
		mixRepeat: repeatRatio(main, road),
		mixStrength: 0.96,
		mixPatchScale: 0.012,
		mixPatchSharpness: 0.44
	});
	const definitions = layerDefinitions(sources);
	material.textureLayers = definitions.map(definition => layer(
		definition,
		size,
		mobile,
		main,
		profile.detail
	));
	material.texturePolicy = policy(main, profile.grass, 'terrain-base');
	material.mixTexturePolicy = policy(road, profile.road, 'road-center');
	return Object.freeze({
		...main,
		layerReports: Object.freeze(material.textureLayers.map(reportLayer)),
		profile,
		sourceWorldUnits: sourceWorldUnits(main, profile.grass)
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

function layerDefinitions(sources) {
	return [
		{ angle: 0.22, image: sources.lush, role: 'lush-grass', strength: 0.56, wetness: 0.18, zones: [1, 0, 0.08, 0] },
		{ angle: -0.71, image: sources.secondary, role: 'meadow-grass', strength: 0.43, wetness: 0.04, zones: [0.84, 0, 0.12, 0.04] },
		{ angle: 1.17, image: sources.soil, role: 'open-soil', strength: 0.34, wetness: -0.08, zones: [0.3, 0, 0.58, 0.12] },
		{ angle: -1.31, image: sources.pathEdge, role: 'road-shoulder', strength: 0.82, wetness: -0.04, zones: [0.16, 1, 0.08, 0] },
		{ angle: 0.83, image: sources.marsh, role: 'moss-and-wet-grass', strength: 0.48, wetness: 0.34, zones: [0.24, 0, 0.76, 0] },
		{ angle: 1.92, image: sources.dry, role: 'dry-ground', strength: 0.4, wetness: -0.2, zones: [0.72, 0, 0.16, 0.12] }
	];
}

function layer(definition, size, mobile, reference, texelsPerWorld) {
	const plan = density(definition.image, size, mobile, texelsPerWorld);
	return {
		...definition,
		density: plan,
		height: [-20, 40],
		repeat: repeatRatio(reference, plan),
		slope: definition.role === 'open-soil' ? [0.08, 0.88] : [0, 0.76],
		texturePolicy: policy(plan, texelsPerWorld, definition.role)
	};
}

function density(image, size, mobile, texelsPerWorld) {
	return textureDensityPlan({
		image,
		maximumAnisotropy: mobile ? 4 : 12,
		mobile,
		texelsPerWorld,
		worldDepth: size,
		worldWidth: size
	});
}

function policy(plan, texelsPerWorld, role) {
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

function sourceWorldUnits(plan, texelsPerWorld) {
	const source = plan.effectiveSource;
	return Object.freeze({
		macro: Object.freeze([source.w / texelsPerWorld / MACRO_SCALE, source.h / texelsPerWorld / MACRO_SCALE]),
		micro: Object.freeze([source.w / texelsPerWorld / MICRO_SCALE, source.h / texelsPerWorld / MICRO_SCALE]),
		tileWorld: plan.tileWorld
	});
}

function reportLayer(value) {
	return Object.freeze({
		role: value.role,
		sourceWorldUnits: sourceWorldUnits(value.density, value.texturePolicy.texelsPerWorld)
	});
}

function repeatRatio(reference, candidate) {
	return [reference.tileWorld[0] / candidate.tileWorld[0], reference.tileWorld[1] / candidate.tileWorld[1]];
}
