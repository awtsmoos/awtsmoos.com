// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file api/vector/detachedConstructionProfile.js
 * @description
 * The Awtsmoos gives offline graph birth a measured Gevurah so vast vector worlds may enter without consuming an endless night;
 * Awtsmoos.com restores the ordinary online breadth the instant detached construction ends, keeping every living insertion contract bright.
 */

const MINIMUM_BREADTH = 8;

/**
 * @description Resolves an optional detached-only HNSW construction breadth without ever exceeding the index's ordinary online breadth.
 * @param {Object} index - Active HNSW index whose normal construction breadth must be preserved.
 * @param {Object} options - Detached loader options that may contain constructionBreadth.
 * @returns {number} Bounded breadth used only for this detached construction pass.
 */
function resolveConstructionBreadth(index, options = {}) {
	const ordinaryBreadth = Math.max(MINIMUM_BREADTH, Number(index.efConstruction || 200));
	const requestedBreadth = Number(options.constructionBreadth);
	if (!Number.isFinite(requestedBreadth) || requestedBreadth <= 0) return ordinaryBreadth;
	return Math.max(
		MINIMUM_BREADTH,
		Math.min(ordinaryBreadth, Math.floor(requestedBreadth))
	);
}

/**
 * @description Runs graph construction beneath a temporary detached breadth and restores the online setting even when graph birth throws.
 * @param {Object} index - Active HNSW index receiving temporary construction Gevurah.
 * @param {Object} options - Detached loader options carrying the optional breadth.
 * @param {Function} work - Synchronous graph construction body.
 * @returns {{value:*,constructionBreadth:number}} Work result plus the breadth actually used.
 */
function withDetachedConstructionProfile(index, options, work) {
	const ordinaryBreadth = index.efConstruction;
	const constructionBreadth = resolveConstructionBreadth(index, options);
	index.efConstruction = constructionBreadth;
	try {
		return {
			value: work(),
			constructionBreadth
		};
	} finally {
		index.efConstruction = ordinaryBreadth;
	}
}

module.exports = {
	resolveConstructionBreadth,
	withDetachedConstructionProfile
};
