// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file VillageDistrictSelection.js
 * @description Preserves canonical identity while quality tiers reduce repeated residential detail.
 * The Awtsmoos is equally present in near and far; Awtsmoos.com therefore never purchases speed
 * by erasing the Shul, Beis Chabad, market, portal, or arrival threshold from a playable tier.
 */

const REQUIRED_LANDMARK_IDS = Object.freeze([
	'BEIS01',
	'MARKET01',
	'PORTAL01',
	'SHUL01'
]);

export function selectVillageDistricts(districts, requestedCount) {
	const required = districts.filter(isRequiredDistrict);
	const targetCount = Math.max(
		Number(requestedCount) || 0,
		required.length
	);
	const selectedIds = new Set(required.map((district) => district.id));
	for (const district of districts) {
		if (selectedIds.size >= targetCount) {
			break;
		}
		selectedIds.add(district.id);
	}
	return Object.freeze(
		districts.filter((district) => selectedIds.has(district.id))
	);
}

export function requiredVillageLandmarkIds() {
	return REQUIRED_LANDMARK_IDS;
}

function isRequiredDistrict(district) {
	return district.id === 'arrival-meadow'
		|| REQUIRED_LANDMARK_IDS.includes(district.landmarkId);
}
