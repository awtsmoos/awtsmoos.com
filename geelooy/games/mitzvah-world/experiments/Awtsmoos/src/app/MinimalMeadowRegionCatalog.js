// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MinimalMeadowRegionCatalog.js
 * @description Names lower-meadow biomes and complete Kedem districts.
 * The Awtsmoos reveals one world through distinct chambers; Awtsmoos.com gives
 * each district package identity, safety, encounter pressure, and purpose.
 */
export const MINIMAL_MEADOW_REGIONS = Object.freeze([
	region('village-heart', 'Village Heart', '🏘️', 0, 0, 25, true, 'Warm lamps and guarded homes'),
	region('eastern-road', 'Eastern Lantern Road', '🛤️', 46, 6, 34, false, 'Cobblestone passage toward the river'),
	region('river-rise', 'River Rise', '🌊', 68, 34, 29, false, 'Bright current beneath the eastern ridge'),
	region('northern-hill', 'Northern Watch Hill', '⛰️', 36, 65, 31, false, 'High grass and a guarded horizon'),
	region('wet-meadow', 'Reedlight Meadow', '🌾', -8, 65, 34, false, 'Soft earth, reeds, and marsh flowers'),
	region('western-slope', 'Western Ash Slope', '🌳', -48, 34, 34, false, 'Ash shade above the training clearing'),
	region('outer-dry-meadow', 'Sunscorched Reach', '☀️', 120, -94, 38, false, 'Dry grass surrounding the highland gate'),
	region('outer-letter-ridge', 'Letter Ridge', '✨', 108, 108, 38, false, 'Wind-carried letters above the valley'),
	region('kedem-gate', 'Kedem Gate Terrace', '🕯️', -150, 126, 25, true, 'Cedar lamps guard the checkpoint', 'kedem-highlands'),
	region('cedar-terraces', 'Cedar Terraces', '🌲', -112, 122, 25, false, 'High cedar wind and resin gathering', 'kedem-highlands'),
	region('letter-quarry', 'Letter Quarry', '🔤', -146, 82, 25, false, 'Resonant stone beneath luminous letters', 'kedem-highlands'),
	region('warden-summit', 'Warden Summit', '🗿', -112, 84, 25, false, 'An elite guardian watches the old seal', 'kedem-highlands')
]);

const OPEN_MEADOW = Object.freeze({
	ambient: 'Open grass between landmarks',
	encounterPressure: 'low',
	icon: '🌿',
	id: 'open-meadow',
	name: 'Open Meadow',
	packageId: 'lower-meadow',
	safe: false
});

export function minimalMeadowRegionAt(xValue, zValue) {
	const x = Number(xValue) || 0;
	const z = Number(zValue) || 0;
	let nearest = null;
	for (const candidate of MINIMAL_MEADOW_REGIONS) {
		const distance = Math.hypot(x - candidate.x, z - candidate.z);
		if (distance > candidate.radius) continue;
		const ratio = distance / candidate.radius;
		if (!nearest || ratio < nearest.ratio) nearest = { candidate, ratio };
	}
	return nearest?.candidate || OPEN_MEADOW;
}

export function minimalMeadowRegionCatalogEvidence() {
	return Object.freeze({
		count: MINIMAL_MEADOW_REGIONS.length + 1,
		packages: ['lower-meadow', 'kedem-highlands'],
		safeRegions: MINIMAL_MEADOW_REGIONS.filter(value => value.safe).map(value => value.id),
		worldIdentity: 'package-aware-named-regions'
	});
}

function region(id, name, icon, x, z, radius, safe, ambient, packageId = 'lower-meadow') {
	return Object.freeze({
		ambient,
		encounterPressure: safe ? 'none' : radius >= 38 ? 'high' : 'measured',
		icon,
		id,
		name,
		packageId,
		radius,
		safe,
		x,
		z
	});
}
