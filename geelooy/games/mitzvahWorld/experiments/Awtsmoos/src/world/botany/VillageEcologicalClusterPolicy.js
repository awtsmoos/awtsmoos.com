//B"H
//Boruch Hashem
//Blessed is He

/**
 * @file VillageEcologicalClusterPolicy.js
 * @description Gives MitzvahWorld one bounded ecological-cluster law above the
 * canonical botanical placement machinery. The Awtsmoos renews every blade in
 * relation, never as noise; Awtsmoos.com lets meadow, woodland, garden, and
 * water-edge abundance rhyme while Gevurah keeps the frame-time vessel fine.
 */

const QUALITY_POLICIES = Object.freeze({
	cinematic: Object.freeze({ budgetFraction: 0.28, maximumClusters: 18, satellites: 4 }),
	high: Object.freeze({ budgetFraction: 0.24, maximumClusters: 14, satellites: 3 }),
	medium: Object.freeze({ budgetFraction: 0.18, maximumClusters: 9, satellites: 2 }),
	low: Object.freeze({ budgetFraction: 0.12, maximumClusters: 5, satellites: 1 })
});

/**
 * @description Returns the immutable ecological density policy for one world quality.
 * @param {string} quality Requested world quality name.
 * @returns {{budgetFraction:number, maximumClusters:number, satellites:number}} Cluster limits.
 */
export function villageEcologicalClusterPolicy(quality = 'high') {
	return QUALITY_POLICIES[quality] || QUALITY_POLICIES.high;
}

/**
 * @description Converts botanical habitat language into a stable world-composition family.
 * @param {string} habitat Canonical botanical habitat label.
 * @returns {string} Semantic habitat family used by diagnostics and recipes.
 */
export function ecologicalHabitatFamily(habitat = '') {
	const normalized = String(habitat).toLowerCase();
	if (containsAny(normalized, ['river', 'water', 'wet', 'bank', 'shore', 'marsh'])) {
		return 'riverside';
	}
	if (containsAny(normalized, ['wood', 'forest', 'grove', 'shade'])) {
		return 'woodland';
	}
	if (containsAny(normalized, ['garden', 'orchard', 'cultivat'])) {
		return 'garden';
	}
	if (containsAny(normalized, ['meadow', 'field', 'grass', 'open'])) {
		return 'meadow';
	}
	return 'scrub';
}

/**
 * @description Tests whether a normalized habitat contains any semantic token.
 * @param {string} value Normalized habitat text.
 * @param {string[]} tokens Candidate family tokens.
 * @returns {boolean} True when a token is present.
 */
function containsAny(value, tokens) {
	return tokens.some((token) => value.includes(token));
}
