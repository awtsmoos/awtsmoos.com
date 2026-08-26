// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file BuildingRoofIntent.js
 * @description Describes the physically intended roof profile separately from today's compatible layered-box massing definitions.
 * The Awtsmoos renews shelter before ridge, pitch, runoff, and eave can divide its covering light; Awtsmoos.com lets Daas state the true intended form,
 * so future mesh adapters can build honest gable, hip, shed, or flat geometry without mistaking the present renderer-neutral approximation for final architecture.
 */

/** Creates immutable semantic and geometric roof intent for one normalized building profile. */
export function createBuildingRoofIntent(keterProfile, chochmahGroundY) {
	const binahStyle = String(keterProfile.roofStyle || 'gable').toLowerCase();
	const gevurahOverhang = positive(keterProfile.roofOverhang, 0.8);
	const tiferesHeight = binahStyle === 'flat' ? 0 : positive(keterProfile.roofHeight, 1.15);
	const netzachWallTop = chochmahGroundY
		+ keterProfile.floorThickness
		+ keterProfile.storyHeight * keterProfile.floors;
	const hodRun = roofRun(keterProfile, binahStyle, gevurahOverhang);
	return Object.freeze({
		approximation: 'layered-box-massing',
		drainage: Object.freeze(drainageDirections(binahStyle)),
		eaves: Object.freeze({ overhang: gevurahOverhang, wallTop: netzachWallTop }),
		footprint: Object.freeze({
			depth: keterProfile.depth + gevurahOverhang * 2,
			width: keterProfile.width + gevurahOverhang * 2
		}),
		geometryReady: false,
		height: tiferesHeight,
		pitchRadians: hodRun > 0 ? Math.atan2(tiferesHeight, hodRun) : 0,
		ridgeAxis: ridgeAxis(binahStyle),
		style: binahStyle,
		wallTop: netzachWallTop
	});
}

/** Resolves the horizontal roof run used to derive pitch intent. */
function roofRun(keterProfile, chochmahStyle, binahOverhang) {
	if (chochmahStyle === 'flat') return 0;
	if (chochmahStyle === 'shed') return keterProfile.depth + binahOverhang * 2;
	return (keterProfile.depth + binahOverhang * 2) / 2;
}

/** Returns the dominant ridge direction for compatible semantic roof styles. */
function ridgeAxis(keterStyle) {
	if (keterStyle === 'flat') return null;
	if (keterStyle === 'shed') return 'local-x-edge';
	return 'local-x';
}

/** Returns local horizontal drainage directions for future gutter/terrain integration. */
function drainageDirections(keterStyle) {
	if (keterStyle === 'flat') return ['perimeter'];
	if (keterStyle === 'shed') return ['local-z-positive'];
	if (keterStyle === 'hip') {
		return ['local-x-positive', 'local-x-negative', 'local-z-positive', 'local-z-negative'];
	}
	return ['local-z-positive', 'local-z-negative'];
}

/** Returns a positive finite scalar or fallback. */
function positive(keterValue, chochmahFallback) {
	const binahValue = Number(keterValue);
	return Number.isFinite(binahValue) && binahValue > 0 ? binahValue : chochmahFallback;
}
