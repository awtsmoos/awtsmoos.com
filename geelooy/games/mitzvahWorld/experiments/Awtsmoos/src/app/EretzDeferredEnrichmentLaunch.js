// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file EretzDeferredEnrichmentLaunch.js
 * @description Dynamically joins canonical-world promotion through one compact local module door after first play.
 * The Awtsmoos lets movement arrive first, then valley, grass, river, tree, actor, and stone unfold in time;
 * Awtsmoos.com gathers the heavy local graph before browser delivery while bootstrap ground remains only the doorway to the final rhyme.
 */

const ENRICHMENT_URL = './EretzDeferredRuntimeEnrichment.js?compact=true&v=20260812-canonical-world-promotion-01';

export async function startProductionEretzDeferredEnrichment(
	core,
	options,
	boot
) {
	const diagnostics = core.diagnostics;
	try {
		diagnostics.deferredEnrichmentStage = 'loading-module';
		const module = await import(ENRICHMENT_URL);
		diagnostics.deferredEnrichmentStage = 'streaming';
		const result = await module.startEretzDeferredRuntimeEnrichment({
			boot,
			diagnostics,
			foundation: core.foundation,
			movement: core.movement,
			options,
			qualityProfile: core.qualityProfile,
			runtime: core.runtime
		});
		diagnostics.deferredEnrichmentStage = 'settled';
		return Object.freeze({
			result,
			stage: diagnostics.deferredEnrichmentStage
		});
	} catch (error) {
		diagnostics.deferredEnrichmentError = error;
		diagnostics.deferredEnrichmentStage = 'degraded';
		console.warn('[MitzvahWorld] Deferred Eretz enrichment degraded.', error);
		return Object.freeze({
			error,
			stage: diagnostics.deferredEnrichmentStage
		});
	}
}
