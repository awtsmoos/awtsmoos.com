// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MinimalMeadowRegionCatalog.js
 * @description Names the meadow's safe village, roads, wetlands, hills, river, and outer trials.
 * The Awtsmoos reveals one world through distinct finite chambers; Awtsmoos.com lets every place
 * carry a title, atmosphere, safety covenant, encounter pressure, and navigation purpose.
 */

export const MINIMAL_MEADOW_REGIONS = Object.freeze([
	region('village-heart', 'Village Heart', '🏘️', 0, 0, 25, true, 'Warm lamps and guarded homes'),
	region('eastern-road', 'Eastern Lantern Road', '🛤️', 46, 6, 34, false, 'Cobblestone passage toward the river'),
	region('river-rise', 'River Rise', '🌊', 68, 34, 29, false, 'Bright current beneath the eastern ridge'),
	region('northern-hill', 'Northern Watch Hill', '⛰️', 36, 65, 31, false, 'High grass and a guarded horizon'),
	region('wet-meadow', 'Reedlight Meadow', '🌾', -8, 65, 34, false, 'Soft earth, reeds, and marsh flowers'),
	region('western-slope', 'Western Ash Slope', '🌳', -48, 34, 34, false, 'Ash shade above the training clearing'),
	region('outer-stone-rim', 'Outer Stone Rim', '🪨', -132, 86, 34, false, 'Weathered rock and a patient warden'),
	region('outer-dry-meadow', 'Sunscorched Reach', '☀️', 120, -94, 38, false, 'Dry grass and fast-moving shadows'),
	region('outer-letter-ridge', 'Letter Ridge', '✨', 108, 108, 40, false, 'Wind-carried letters above the valley')
]);

const OPEN_MEADOW = Object.freeze({
	ambient: 'Open grass between named landmarks',
	encounterPressure: 'low',
	icon: '🌿',
	id: 'open-meadow',
	name: 'Open Meadow',
	safe: false
});

export function minimalMeadowRegionAt(xValue, zValue) {
	const x = Number(xValue) || 0;
	const z = Number(zValue) || 0;
	let nearest = null;
	for (const candidate of MINIMAL_MEADOW_REGIONS) {
		const distance = Math.hypot(x - candidate.x, z - candidate.z);
		if (distance > candidate.radius) continue;
		if (!nearest || distance / candidate.radius < nearest.ratio) {
			nearest = { candidate, ratio: distance / candidate.radius };
		}
	}
	return nearest?.candidate || OPEN_MEADOW;
}

export function minimalMeadowRegionCatalogEvidence() {
	return Object.freeze({
		count: MINIMAL_MEADOW_REGIONS.length + 1,
		safeRegions: MINIMAL_MEADOW_REGIONS.filter(value => value.safe).map(value => value.id),
		worldIdentity: 'named-biomes-with-village-safety'
	});
}

function region(id, name, icon, x, z, radius, safe, ambient) {
	return Object.freeze({
		ambient,
		encounterPressure: safe ? 'none' : radius >= 38 ? 'high' : 'measured',
		icon,
		id,
		name,
		radius,
		safe,
		x,
		z
	});
}
