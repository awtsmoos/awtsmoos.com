// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file EretzOptionalWorldStreaming.js
 * @description Sequences forest, landmark, and botanical enrichment after movement.
 * The Awtsmoos reveals one garden after another instead of one blocking avalanche;
 * Awtsmoos.com exposes the whole chain, its cleanup, and its bounded living state.
 */

import { startEretzBotanicalStreaming } from './EretzBotanicalStreaming.js';
import { startEretzTerrainStreaming } from './EretzTerrainStreaming.js';

export function startEretzOptionalWorldStreaming(
	foundation,
	diagnostics,
	qualityProfile,
	options = {}
) {
	let destroyed = false;
	let botanical = null;
	const terrain = startEretzTerrainStreaming(foundation, diagnostics, options);
	const terrainPromise = diagnostics.terrainEnrichmentPromise
		|| Promise.resolve({ state: 'not-required' });
	const botanicalGatePromise = terrainPromise.then(() => {
		if (destroyed) return { state: 'destroyed-before-botany' };
		botanical = startEretzBotanicalStreaming(
			foundation,
			diagnostics,
			qualityProfile,
			options
		);
		return diagnostics.botanicalEnrichmentPromise;
	});
	const controller = {
		destroy() {
			destroyed = true;
			botanical?.destroy();
			terrain?.destroy();
		},
		snapshot() {
			return Object.freeze({
				botanical: botanical?.snapshot() || { state: 'waiting' },
				destroyed,
				terrain: terrain?.snapshot() || { state: 'not-required' }
			});
		}
	};
	diagnostics.botanicalStreamingGatePromise = botanicalGatePromise;
	diagnostics.optionalWorldStreaming = controller;
	diagnostics.optionalWorldStreamingState = () => controller.snapshot();
	return controller;
}

export default startEretzOptionalWorldStreaming;
