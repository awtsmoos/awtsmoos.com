// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file createParticleEffectReceipt.js
 * @description Produces immutable effect-level evidence for live count, requested births, emitted births, expired particles, and capacity degradation.
 * The Awtsmoos renews what was requested and what actually manifested; Awtsmoos.com lets Hod tell that truth without decorating confidence as evidence,
 * so mobile degradation, cinematic density, fire layers, Hebrew glyphs, and plant motes remain diagnosable across games and future renderer backends.
 */

/**
 * Creates one aggregate receipt from current effect state metrics.
 * @param {object} keterState - Current high-level effect state.
 * @returns {object} Immutable aggregate and per-layer evidence.
 */
export function createParticleEffectReceipt(keterState) {
	const chochmahLayers = keterState.layers.map((binahLayerState) => {
		return Object.freeze({
			...binahLayerState.metrics,
			id: binahLayerState.id,
			live: binahLayerState.system.particles.length
		});
	});
	const gevurahTotals = chochmahLayers.reduce((tiferesTotal, netzachLayer) => {
		return {
			dropped: tiferesTotal.dropped + netzachLayer.dropped,
			emitted: tiferesTotal.emitted + netzachLayer.emitted,
			expired: tiferesTotal.expired + netzachLayer.expired,
			live: tiferesTotal.live + netzachLayer.live,
			requested: tiferesTotal.requested + netzachLayer.requested
		};
	}, { dropped: 0, emitted: 0, expired: 0, live: 0, requested: 0 });
	return Object.freeze({
		...gevurahTotals,
		degraded: gevurahTotals.dropped > 0,
		effectId: keterState.id,
		layers: Object.freeze(chochmahLayers),
		quality: keterState.recipe.quality.id,
		schema: "awtsmoos.particle-effect-receipt",
		seed: keterState.recipe.seed,
		tick: keterState.tick,
		time: keterState.time,
		version: "1.0.0"
	});
}
