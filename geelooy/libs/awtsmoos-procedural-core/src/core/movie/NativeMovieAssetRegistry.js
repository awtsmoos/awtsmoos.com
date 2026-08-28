//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file NativeMovieAssetRegistry.js
 * @description The Awtsmoos names each hidden generator so AI may ask and truly receive;
 * Awtsmoos.com loads the native vessel only when a renderer is ready to weave.
 */

const NATIVE_MOVIE_ASSETS = Object.freeze({
	human: nativeAsset("human", "3d", "createRiggedHuman", () => import("../components/human/humanGenerator.js")),
	"mesh-text": nativeAsset("mesh-text", "3d", "compileMeshText", () => import("../meshText/meshTextCompiler.js")),
	creature: nativeAsset("creature", "3d", "createCreature", () => import("../animalMesh/creature/CreatureCreator.js")),
	rock: nativeAsset("rock", "3d", "createRockMesh", () => import("../geometry/generators/rock/RockGenerator.js")),
	"particle-system": nativeAsset("particle-system", "hybrid", "createParticleSystem", () => import("../proceduralObject/particles/createParticleSystem.js")),
	"particle-effects": nativeAsset("particle-effects", "hybrid", null, () => import("../proceduralObject/particles/effects/api/ParticleEffectsApi.js")),
	building: nativeAsset("building", "3d", null, () => import("../natureApi/BuildingNatureApi.js")),
	texture: nativeAsset("texture", "hybrid", null, () => import("../materials/generation/TextureGenerationGateway.js"))
});

function nativeAsset(id, mode, factory, load) {
	return Object.freeze({ id, mode, factory, load });
}

/**
 * Describes native systems without loading their heavier renderer dependencies.
 *
 * @returns {Array<object>} Stable AI-readable capability descriptors.
 */
export function describeNativeMovieAssets() {
	return Object.values(NATIVE_MOVIE_ASSETS).map(({ id, mode, factory }) => ({
		id,
		mode,
		factory,
		native: true
	}));
}

/**
 * Loads the real procedural-core module behind a declared movie asset family.
 *
 * @param {string} id Stable asset-system identifier.
 * @returns {Promise<object>} Native ES module namespace.
 */
export async function loadNativeMovieAssetSystem(id) {
	const descriptor = NATIVE_MOVIE_ASSETS[id];
	if (!descriptor) throw new RangeError(`Unknown native movie asset system: ${id}`);
	return descriptor.load();
}

/**
 * Invokes a proven native factory instead of returning a merely symbolic recipe.
 *
 * @param {string} id Stable asset-system identifier.
 * @param {...unknown} args Arguments accepted by the native factory.
 * @returns {Promise<unknown>} Real procedural-core generated value.
 */
export async function generateNativeMovieAsset(id, ...args) {
	const descriptor = NATIVE_MOVIE_ASSETS[id];
	if (!descriptor?.factory) throw new TypeError(`Native system ${id} requires direct module use.`);
	const module = await descriptor.load();
	const factory = module[descriptor.factory];
	if (typeof factory !== "function") throw new TypeError(`Native factory ${descriptor.factory} is unavailable.`);
	return factory(...args);
}
