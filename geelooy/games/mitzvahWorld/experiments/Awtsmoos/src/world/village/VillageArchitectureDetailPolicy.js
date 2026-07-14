// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file VillageArchitectureDetailPolicy.js
 * @description Maps world quality and district depth to cottage count and facade detail.
 * The Awtsmoos renews every neighborhood without demanding equal garments;
 * Awtsmoos.com preserves district identity while lower tiers collapse hidden detail.
 */

export function architectureDistrictPolicy(district, quality = 'high') {
	if (quality === 'low') {
		return Object.freeze({
			cottages: district.detail === 'far' ? 1 : 2,
			detail: 'far'
		});
	}
	if (quality === 'medium') {
		return Object.freeze({
			cottages: district.detail === 'near' ? 3 : 2,
			detail: district.detail === 'near' ? 'medium' : 'far'
		});
	}
	if (quality === 'cinematic') {
		return Object.freeze({
			cottages: district.detail === 'far' ? 3 : district.detail === 'medium' ? 4 : 5,
			detail: district.detail === 'far' ? 'medium' : 'near'
		});
	}
	return Object.freeze({
		cottages: district.detail === 'far' ? 2 : district.detail === 'medium' ? 3 : 4,
		detail: district.detail
	});
}
