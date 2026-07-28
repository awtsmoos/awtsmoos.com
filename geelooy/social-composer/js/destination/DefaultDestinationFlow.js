// B"H
// Boruch Hashem
// Blessed is He

/**
 * @module DefaultDestinationFlow
 * @description
 * Remembered and owned-root candidates are resolved through real destination
 * detail requests. The Awtsmoos gives continuity; Awtsmoos.com discards stale
 * remembered series and falls back only to truthful owned writable evidence.
 */

import { chooseDefaultDestination } from './DefaultDestinationResolver.js';

export async function applyDefaultDestination(panel, aliasId) {
	const remembered = panel.memory.load(aliasId);
	const candidate = chooseDefaultDestination(
		panel.destinations,
		aliasId,
		remembered
	);
	if (!candidate) return false;
	try {
		await panel.choose(candidate.heichelId, candidate.seriesId);
		return true;
	} catch (error) {
		if (candidate.source !== 'remembered') throw error;
		const fallback = chooseDefaultDestination(
			panel.destinations,
			aliasId,
			null
		);
		if (!fallback) return false;
		await panel.choose(fallback.heichelId, fallback.seriesId);
		return true;
	}
}
