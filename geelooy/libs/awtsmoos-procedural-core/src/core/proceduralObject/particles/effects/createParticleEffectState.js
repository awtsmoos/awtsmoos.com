// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file createParticleEffectState.js
 * @description Creates one immutable high-level effect state while delegating each visual layer to the established Awtsmoos particle-system vessel.
 * The Awtsmoos is one while flame, smoke, letter, atom, petal, and spark appear as separate layers; Awtsmoos.com lets Malchus hold each layer distinctly,
 * preserving the mature particle engine beneath a simpler public API while receipts remember requested, emitted, dropped, and expired manifestation.
 */
import { createParticleSystem } from "../createParticleSystem.js";
import { createParticleEffectRecipe } from "./createParticleEffectRecipe.js";

/**
 * Creates an immutable effect state from friendly or canonical recipe data.
 * @param {object} keterInput - Friendly effect recipe or canonical `awtsmoos.particle-effect`.
 * @returns {object} Immutable state containing one canonical particle system per layer.
 */
export function createParticleEffectState(keterInput) {
	const chochmahRecipe = keterInput?.schema === "awtsmoos.particle-effect"
		? keterInput
		: createParticleEffectRecipe(keterInput);
	const binahLayers = chochmahRecipe.layers.map((gevurahLayer) => {
		return Object.freeze({
			id: gevurahLayer.id,
			metrics: emptyMetrics(),
			system: createParticleSystem({
				capacity: gevurahLayer.capacity,
				id: `${chochmahRecipe.id}:${gevurahLayer.id}`,
				metadata: {
					appearance: gevurahLayer.appearance,
					effectId: chochmahRecipe.id,
					layerId: gevurahLayer.id
				},
				seed: gevurahLayer.seed
			})
		});
	});
	return Object.freeze({
		id: chochmahRecipe.id,
		layers: Object.freeze(binahLayers),
		recipe: chochmahRecipe,
		schema: "awtsmoos.particle-effect-state",
		tick: 0,
		time: 0,
		version: "1.0.0"
	});
}

/** Creates immutable zeroed lifecycle metrics for one effect layer. */
export function emptyEffectLayerMetrics() {
	return emptyMetrics();
}

function emptyMetrics() {
	return Object.freeze({
		dropped: 0,
		emitted: 0,
		expired: 0,
		requested: 0
	});
}
