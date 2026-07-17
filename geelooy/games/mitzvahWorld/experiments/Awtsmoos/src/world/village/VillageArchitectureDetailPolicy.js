// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file VillageArchitectureDetailPolicy.js
 * @description Scales repeated cottage detail while preserving every authored H10-H27 home.
 * The Awtsmoos reveals one enduring community through changing vessels; Awtsmoos.com may
 * simplify windows and infill, but it never trades a named dwelling for an empty hillside.
 */

/**
 * Resolves cottage count and detail for one district and quality tier.
 *
 * @param {object} district Canonical district contract.
 * @param {string} [quality='high'] Requested quality tier.
 * @returns {Readonly<{cottages: number, detail: string}>} Protected district policy.
 */
export function architectureDistrictPolicy(district, quality = 'high') {
	if (district.id === 'arrival-meadow') {
		return policy(district, 2, arrivalDetail(quality));
	}
	if (quality === 'low') {
		const repeatedCount = district.detail === 'far' ? 1 : 2;
		return policy(district, repeatedCount, 'far');
	}
	if (quality === 'medium') {
		const repeatedCount = district.detail === 'near' ? 3 : 2;
		const detail = district.detail === 'near' ? 'medium' : 'far';
		return policy(district, repeatedCount, detail);
	}
	if (quality === 'cinematic') {
		const repeatedCount = district.detail === 'far'
			? 3
			: district.detail === 'medium'
				? 4
				: 5;
		const detail = district.detail === 'far' ? 'medium' : 'near';
		return policy(district, repeatedCount, detail);
	}
	const repeatedCount = district.detail === 'far'
		? 2
		: district.detail === 'medium'
			? 3
			: 4;
	return policy(district, repeatedCount, district.detail);
}

/**
 * Protects authored houses while allowing optional infill to scale.
 *
 * @param {object} district Canonical district contract.
 * @param {number} repeatedCount Quality-scaled requested cottage count.
 * @param {string} detail Detail class.
 * @returns {Readonly<{cottages: number, detail: string}>} Frozen policy.
 */
function policy(district, repeatedCount, detail) {
	const canonicalCount = Array.isArray(district.houseIds)
		? district.houseIds.length
		: 0;
	return Object.freeze({
		cottages: Math.max(canonicalCount, repeatedCount),
		detail
	});
}

/**
 * Resolves arrival detail without changing its authored pair of homes.
 *
 * @param {string} quality Requested quality tier.
 * @returns {string} Arrival detail class.
 */
function arrivalDetail(quality) {
	if (quality === 'low') {
		return 'far';
	}
	if (quality === 'medium') {
		return 'medium';
	}
	return 'near';
}
