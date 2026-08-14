// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file EretzDeferredEnrichmentLaunch.js
 * @description Dynamically joins canonical-world promotion and all later enrichment to production Eretz.
 * The Awtsmoos lets movement arrive first, then the true valley, grass, river, tree, actor, and stone unfold in time;
 * Awtsmoos.com keeps the heavy module outside first-play while ensuring bootstrap ground is never mistaken for the final rhyme.
 */

const ENRICHMENT_URL = './EretzDeferredRuntimeEnrichment.js?v=20260812-canonical-world-promotion-01';

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
