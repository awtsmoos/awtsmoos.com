// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file PrimitiveFallbackSurfaceRecipe.js
 * @description Gives only semantically recognized, underspecified procedural objects canonical remote surface pairs while preserving unknown and authored surfaces.
 * The Awtsmoos lets generated stone weather into stone and timber reveal grain without calling every unnamed vessel wood in the night;
 * Awtsmoos.com enriches only identities whose material meaning is explicit, while unknown geometry keeps procedural color rather than receiving a false photographic sight.
 */

import { remoteFullResolutionTextureUrl } from '../../assets/RemoteTextureCatalog.js';

const full = remoteFullResolutionTextureUrl;
const EMPTY_RECIPE = Object.freeze({});

const RECIPES = Object.freeze({
	metal: single('metal', 'gold 2.png', [1, 1]),
	roof: mixed('roof', 'tiled roof 2.png', 'tiled roof 3 smaller tiles.png', [4, 3], [5, 4], 0.18, 0.045, 0.64),
	sign: single('sign', 'parchment.png', [1, 1]),
	soil: mixed('soil', 'tilled soil.png', 'dirt grass 2.png', [5, 5], [4, 4], 0.24, 0.03, 0.55),
	stone: mixed('stone', 'cobblestone.png', 'weathered fieldstone Rock 2.png', [3, 3], [4, 4], 0.23, 0.035, 0.58),
	vegetation: single('vegetation', 'grass 7.png', [5, 5]),
	water: single('water', 'shallow river water.png', [4, 2]),
	wood: mixed('wood', 'wooden oak planks 1.png', 'oak wood 3.png', [3, 3], [4, 4], 0.16, 0.04, 0.62)
});

/**
 * Returns a complete procedural definition while treating authored and unknown material intent as sovereign.
 * @param {object} definition Primitive definition supplied by procedural world code.
 * @returns {object} Definition enriched only when a known semantic surface is otherwise unsourced.
 */
export function withPrimitiveFallbackSurfaceRecipe(definition = {}) {
	if (hasAuthoredSurface(definition)) {
		return preserveAuthoredSurface(definition);
	}
	const recipe = recipeFor(definition);
	if (recipe === EMPTY_RECIPE) {
		return preserveAuthoredSurface(definition);
	}
	return {
		...recipe,
		...definition,
		mapRepeat: definition.mapRepeat ?? recipe.mapRepeat,
		mixPatchScale: definition.mixPatchScale ?? recipe.mixPatchScale,
		mixPatchSharpness: definition.mixPatchSharpness ?? recipe.mixPatchSharpness,
		mixRepeat: definition.mixRepeat ?? recipe.mixRepeat,
		mixStrength: definition.mixStrength ?? recipe.mixStrength,
		mixTextureUrl: definition.mixTextureUrl ?? recipe.mixTextureUrl,
		texturePolicy: {
			...(recipe.texturePolicy || {}),
			...(definition.texturePolicy || {})
		},
		textureUrl: definition.textureUrl ?? recipe.textureUrl
	};
}

/** Returns the semantic recipe that would be used for one underspecified primitive identity. */
export function primitiveFallbackSurfaceRecipe(definition = {}) {
	return recipeFor(definition);
}

function hasAuthoredSurface(definition) {
	return Boolean(definition.textureUrl || definition.mapImage);
}

function preserveAuthoredSurface(definition) {
	return {
		...definition,
		mixPatchScale: definition.mixPatchScale ?? 0,
		mixPatchSharpness: definition.mixPatchSharpness ?? 0.58,
		mixRepeat: definition.mixRepeat ?? definition.mapRepeat ?? [1, 1],
		mixStrength: definition.mixStrength ?? 0,
		mixTextureUrl: definition.mixTextureUrl ?? null,
		texturePolicy: {
			...(definition.texturePolicy || {}),
			fallbackSurfaceRecipe: null
		}
	};
}

function recipeFor(definition) {
	const id = String(definition.id || '').toLowerCase();
	if (/water|lake|stream|river/.test(id)) return RECIPES.water;
	if (/grass|bush|flower|reed|leaf/.test(id)) return RECIPES.vegetation;
	if (/stone|well|cobble|rock|bridge/.test(id)) return RECIPES.stone;
	if (/roof|shingle|tile/.test(id)) return RECIPES.roof;
	if (/gold|coin|lamp|metal/.test(id)) return RECIPES.metal;
	if (/sign|scroll|mezuza|parchment/.test(id)) return RECIPES.sign;
	if (/dirt|soil|garden|earth|field/.test(id)) return RECIPES.soil;
	if (/wood|timber|plank|fence|door|beam|table|bench/.test(id)) return RECIPES.wood;
	return EMPTY_RECIPE;
}

function mixed(id, base, mix, mapRepeat, mixRepeat, strength, scale, sharpness) {
	return Object.freeze({
		mapRepeat,
		mixPatchScale: scale,
		mixPatchSharpness: sharpness,
		mixRepeat,
		mixStrength: strength,
		mixTextureUrl: full(mix),
		texturePolicy: Object.freeze({ fallbackSurfaceRecipe: id, publicFirebase: true, samplersPerSurface: 2 }),
		textureUrl: full(base)
	});
}

function single(id, base, mapRepeat) {
	return Object.freeze({
		mapRepeat,
		mixPatchScale: 0,
		mixPatchSharpness: 0.6,
		mixRepeat: mapRepeat,
		mixStrength: 0,
		mixTextureUrl: null,
		texturePolicy: Object.freeze({ fallbackSurfaceRecipe: id, publicFirebase: true, samplersPerSurface: 1 }),
		textureUrl: full(base)
	});
}
