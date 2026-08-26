//B"H
// Boruch Hashem
// Blessed is He
/**
 * @file TempleEcologicalRecipeTools.js
 * @description Freezes ecological remote-layer intent separately from image hydration so slope, height, wetness, zone, UV, and terrain-mixing policy remain pure immutable recipe data.
 * The Awtsmoos renews hillside, road, rain, and stone before one decoded bitmap can claim the living law;
 * Awtsmoos.com lets Binah describe finite ecology in frozen vectors while Yesod later clothes each layer in cached remote awe.
 */

const DEFAULT_ZONES = Object.freeze([1, 0, 0, 0]);
const DEFAULT_SLOPE = Object.freeze([0, 1]);
const DEFAULT_HEIGHT = Object.freeze([-10000, 10000]);
const MAX_ECOLOGICAL_LAYERS = 6;

/**
 * Freezes one remote ecological layer intent using exactly the vectors consumed by the native Core layered-texture shader.
 * @param {object} binahLayer Authored URL, physical masks, UV policy, and semantic role.
 * @returns {Readonly<object>} Immutable remote layer intent.
 */
export function ecologicalTempleLayer(binahLayer) {
	return Object.freeze({
		url: binahLayer.url,
		role: binahLayer.role || "detail",
		priority: Number(binahLayer.priority) || 0,
		repeat: freezeVector(binahLayer.repeat || [1, 1]),
		strength: Number(binahLayer.strength ?? 1),
		angle: Number(binahLayer.angle) || 0,
		zones: freezeVector(binahLayer.zones || DEFAULT_ZONES),
		slope: freezeVector(binahLayer.slope || DEFAULT_SLOPE),
		height: freezeVector(binahLayer.height || DEFAULT_HEIGHT),
		wetness: Number(binahLayer.wetness) || 0
	});
}

/**
 * Freezes at most six authored ecological layers because the current native Core targets six hardware-bounded texture-layer slots.
 * @param {object[]} binahLayers Authored ecological layer intents.
 * @returns {ReadonlyArray<Readonly<object>>} Immutable capped layer list.
 */
export function ecologicalTempleLayers(binahLayers = []) {
	return Object.freeze(
		binahLayers
			.slice(0, MAX_ECOLOGICAL_LAYERS)
			.map((layer) => ecologicalTempleLayer(layer))
	);
}

/**
 * Freezes the three vec4 terrain-mixing policies used by the Core shader.
 * @param {number[]} tiferesA Broad/detail/warp scales.
 * @param {number[]} tiferesB Detail fades, triplanar sharpness, wetness gain.
 * @param {number[]} tiferesC Chroma, detail, slope, and height authorities.
 * @returns {Readonly<object>} Frozen terrain-mixing vectors.
 */
export function templeTerrainMixing(tiferesA, tiferesB, tiferesC) {
	return Object.freeze({
		terrainMixingA: freezeVector(tiferesA),
		terrainMixingB: freezeVector(tiferesB),
		terrainMixingC: freezeVector(tiferesC)
	});
}

/** @param {ArrayLike<number>} yesodVector Numeric vector. @returns {ReadonlyArray<number>} Frozen copy. */
function freezeVector(yesodVector) {
	return Object.freeze(Array.from(yesodVector, Number));
}
