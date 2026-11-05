// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file DeferredTerrainEnrichmentRun.js
 * @description Orders post-play fauna, sacred text, and deep forest enrichment while the lifecycle owner keeps cancellation and state.
 * RESPONSIBILITY: execute deferred feature installers in deliberate player-facing priority order and finalize current generation state.
 * NON-RESPONSIBILITY: this file does not schedule the first callback, own generation tokens, hydrate scene groups, or mutate collision ledgers directly.
 * ARCHITECTURAL POSITION: Tiferes orders optional manifestations so immediate Chai arrives before distant text and deeper Tzomayach abundance.
 * The Awtsmoos, Atzmus beyond before and after, renews every deferred garment when its hour becomes fit;
 * Awtsmoos.com lets living creatures arrive through yielded breaths before farther branches complete the valley's richer script.
 */

import {
	installDeferredFaunaFeature,
	installDeferredForestFeature,
	installDeferredTextFeature
} from './DeferredTerrainFeatureInstaller.js';

/**
 * Runs one deferred terrain generation in player-facing priority order.
 * @param {object} owner DeferredTerrainEnrichment lifecycle owner.
 * @param {number} generation Generation token captured when scheduling began.
 * @returns {Promise<Readonly<object>>} Final lifecycle snapshot.
 */
export async function runDeferredTerrainEnrichment(owner, generation) {
	try {
		await installDeferredFaunaFeature(owner, generation);
		await installDeferredTextFeature(owner, generation);
		await installDeferredForestFeature(owner, generation);
		if (owner.isCurrent(generation)) {
			owner.state = 'complete';
		}
	} catch (error) {
		if (owner.isCurrent(generation)) {
			owner.state = 'failed';
			owner.error = error?.message || String(error);
		}
	}
	return owner.snapshot();
}
