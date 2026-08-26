// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file RealityFlowerSpecies.js
 * @description Normalizes semantic flower-species requests before the canonical Tzomayach cluster authority receives them.
 * The Awtsmoos, Atzmus beyond every petal and name, renews each species before a garden may appear;
 * Awtsmoos.com lets this small Binah vessel preserve caller order and honest defaults, so floral abundance remains simple and clear.
 */

/**
 * Normalizes one flower species string or ordered array into a non-empty immutable list.
 * @param {unknown} speciesOhr Candidate species string, array, or absent value.
 * @returns {Readonly<Array<string>>} Frozen ordered species identifiers with canonical daisy fallback.
 */
export function normalizeRealityFlowerSpecies(speciesOhr) {
	const speciesOros = Array.isArray(speciesOhr)
		? speciesOhr.map(String).map(valueOhr => valueOhr.trim()).filter(Boolean)
		: [String(speciesOhr || 'daisy').trim()].filter(Boolean);
	return Object.freeze(speciesOros.length ? speciesOros : ['daisy']);
}

/**
 * Aggregates additive diagnostics from canonical Nature cluster envelopes without rewriting their internal contracts.
 * @param {Readonly<Array<object>>} clustersMalchus Canonical Nature plant-cluster results.
 * @returns {Readonly<object>} Frozen aggregate cluster and plant-count evidence.
 */
export function createRealityFlowerDiagnostics(clustersMalchus) {
	const plantCountNetzach = clustersMalchus.reduce((sumTiferes, clusterKli) => {
		return sumTiferes + Number(clusterKli?.diagnostics?.plantCount || 0);
	}, 0);
	return Object.freeze({
		clusterCount: clustersMalchus.length,
		plantCount: plantCountNetzach
	});
}
