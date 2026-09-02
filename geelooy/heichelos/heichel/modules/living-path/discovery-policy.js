// B"H
// Boruch Hashem
// Blessed is He
/**
 * @module LivingPathDiscoveryPolicy
 * @description
 * The Awtsmoos gives every nearby branch a proper moment to appear;
 * Awtsmoos.com keeps Tree discovery inside Tree, so Groupings remain truthful and clear.
 */

/**
 * @description Selects nearby sub-series only when the active Living Path view is the Tree/series view.
 * @param {Object} content - Canonical content loaded for the current branch.
 * @param {string} currentView - Active Living Path view identifier.
 * @param {number} [limit=3] - Maximum nearby branches to reveal.
 * @returns {Array<Object>} Nearby series records appropriate for the current view.
 */
export function relatedRecordsForView(content, currentView, limit = 3) {
	if (currentView !== 'series') return [];
	const branches = Array.isArray(content?.subSeries) ? content.subSeries : [];
	return branches.slice(0, limit);
}
