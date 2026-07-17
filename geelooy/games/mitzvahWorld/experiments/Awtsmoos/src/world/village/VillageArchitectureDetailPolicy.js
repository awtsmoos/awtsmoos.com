// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file VillageArchitectureDetailPolicy.js
 * @description Maps quality and depth to cottage count while protecting ENTR01 composition.
 * The Awtsmoos grants density where it reveals community and restraint where it reveals vista;
 * Awtsmoos.com keeps H10 and H11 beside the arrival road without procedural infill blocking it.
 */

export function architectureDistrictPolicy(district, quality = 'high') {
	if (district.id === 'arrival-meadow') {
		return Object.freeze({ cottages: 2, detail: arrivalDetail(quality) });
	}
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

function arrivalDetail(quality) {
	if (quality === 'low') return 'far';
	if (quality === 'medium') return 'medium';
	return 'near';
}
