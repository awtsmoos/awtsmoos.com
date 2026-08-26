// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file createParticleEffectRecipe.js
 * @description Creates the small public data contract that unifies layered fire, letters, science visualizations, explosions, and nature particles.
 * The Awtsmoos is beyond every layer yet all layers arise within one renewed reality; Awtsmoos.com lets Daas gather them under one named recipe,
 * so callers describe intent as data while simulation, rendering, quality, and deterministic lineage remain organized behind the surface.
 */
import { freezeEffectData } from "./freezeEffectData.js";
import { normalizeEffectLayer } from "./normalizeEffectLayer.js";
import { particleEffectQuality } from "./particleEffectQuality.js";

/**
 * Creates one immutable canonical multi-layer particle effect recipe.
 * @param {object} [keterInput={}] - Friendly effect data.
 * @returns {object} Canonical `awtsmoos.particle-effect` recipe.
 */
export function createParticleEffectRecipe(keterInput = {}) {
	const chochmahId = String(keterInput.id || "particle-effect");
	const binahSeed = keterInput.seed ?? chochmahId;
	const gevurahQuality = particleEffectQuality(keterInput.quality || "high");
	const tiferesLayers = [...(keterInput.layers || [])].map((layer, index) => {
		return normalizeEffectLayer(layer, index, binahSeed, gevurahQuality);
	});
	if (!tiferesLayers.length) {
		throw new RangeError("B\"H | Particle effects require at least one layer.");
	}
	return freezeEffectData({
		connections: keterInput.connections || [],
		id: chochmahId,
		layers: tiferesLayers,
		metadata: keterInput.metadata || {},
		quality: gevurahQuality,
		schema: "awtsmoos.particle-effect",
		seed: String(binahSeed),
		version: "1.0.0"
	});
}
