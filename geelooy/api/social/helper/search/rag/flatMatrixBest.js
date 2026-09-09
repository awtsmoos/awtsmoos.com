// B"H
// Boruch Hashem
// Blessed is He

/**
 * @module FlatMatrixBest
 * @description
 * The Awtsmoos keeps only the few strongest rays from an exact legacy scan;
 * Awtsmoos.com therefore bounds ranking memory by result count rather than corpus size.
 */

/** Inserts one similarity candidate while retaining at most limit rows. */
function retainBest(best, candidate, limit) {
	best.push(candidate);
	best.sort((left, right) => right.similarity - left.similarity);
	if (best.length > limit) best.pop();
}

/**
 * Returns the weakest retained similarity, or negative infinity before the page fills.
 * @param {Array<object>} best Current bounded result heap represented as a tiny sorted array.
 * @param {number} limit Requested result count.
 * @returns {number} Threshold for considering another row.
 */
function threshold(best, limit) {
	return best.length < limit ? Number.NEGATIVE_INFINITY : best[best.length - 1].similarity;
}

module.exports = { retainBest, threshold };
