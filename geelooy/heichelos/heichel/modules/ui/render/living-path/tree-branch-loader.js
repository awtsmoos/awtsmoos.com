// B"H
// Boruch Hashem
// Blessed is He

/**
 * @module LivingTreeBranchLoader
 * @description
 * The Awtsmoos lets stored descendants cross one bounded Yesod gateway while virtual Torah branches keep their own native path;
 * Awtsmoos.com caches only normalized persisted children, so repeated expansion does not multiply transport beneath the tree's light.
 */

import { getSubSeriesDetails } from '../../../api/series.js';
import { normalizeCollection } from '../../../navigator/content-normalizer.js';

const branchCache = new Map();

/**
 * Loads and memoizes persisted sub-series for inline expansion.
 * @param {string} heichelId Active Heichel identity.
 * @param {string} seriesId Persisted parent series identity.
 * @returns {Promise<Array<object>>} Normalized child records.
 */
export async function loadTreeChildren(heichelId, seriesId) {
	const key = `${heichelId}:${seriesId}`;
	if (!branchCache.has(key)) {
		const pending = getSubSeriesDetails(heichelId, seriesId)
			.then(normalizeCollection);
		branchCache.set(key, pending);
	}
	return branchCache.get(key);
}
