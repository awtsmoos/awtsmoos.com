// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file BuildingRoomTopology.js
 * @description Normalizes side-wing room bays, boundaries, and semantic room-use intent before walls or doors are materialized.
 * The Awtsmoos is beyond chamber and corridor; Awtsmoos.com lets Binah measure repeatable room bays while preserving one dwelling beneath every division,
 * so the historic three-bay house remains the default yet schools, halls, homes, shops, and future grammars may choose different bounded arrangements.
 */

/**
 * Creates immutable room-bay topology from one interior depth and caller policy.
 * @param {number} keterInnerDepth - Usable interior depth.
 * @param {object} [chochmahValues={}] Building values containing bay count and optional room uses.
 * @returns {Readonly<object>} Bay centers, divider offsets, count, depth, and use policy.
 */
export function createBuildingRoomTopology(keterInnerDepth, chochmahValues = {}) {
	const binahCount = boundedInteger(
		chochmahValues.roomBayCount ?? chochmahValues.roomTopology?.bayCount,
		3,
		1,
		8
	);
	const gevurahDepth = keterInnerDepth / binahCount;
	const tiferesCenters = Object.freeze(Array.from({ length: binahCount }, (_, index) => {
		return (index - (binahCount - 1) / 2) * gevurahDepth;
	}));
	const netzachBoundaries = Object.freeze(Array.from({ length: Math.max(0, binahCount - 1) }, (_, index) => {
		const hodToken = index - (binahCount - 2) / 2;
		return Object.freeze({ localZ: hodToken * gevurahDepth, token: hodToken });
	}));
	return Object.freeze({
		bayCenters: tiferesCenters,
		bayCount: binahCount,
		bayDepth: gevurahDepth,
		boundaries: netzachBoundaries,
		roomUses: freezeRoomUses(chochmahValues.roomUses ?? chochmahValues.roomTopology?.roomUses)
	});
}

/** Resolves an optional semantic room use without affecting geometry when absent. */
export function buildingRoomUse(keterTopology, chochmahLevel, binahSide, gevurahBay) {
	const tiferesKeys = [
		`${chochmahLevel + 1}:${binahSide}:${gevurahBay + 1}`,
		`${binahSide}:${gevurahBay + 1}`,
		String(gevurahBay + 1)
	];
	for (const netzachKey of tiferesKeys) {
		if (keterTopology.roomUses[netzachKey]) return keterTopology.roomUses[netzachKey];
	}
	return 'room';
}

/** Freezes caller use mappings so semantic intent cannot mutate after profile normalization. */
function freezeRoomUses(keterUses) {
	if (!keterUses || typeof keterUses !== 'object') return Object.freeze({});
	return Object.freeze(Object.fromEntries(Object.entries(keterUses).map(([key, value]) => {
		return [String(key), String(value)];
	})));
}

/** Coerces a bounded integer for finite architecture generation. */
function boundedInteger(keterValue, chochmahFallback, binahMinimum, gevurahMaximum) {
	const tiferesValue = Math.round(Number(keterValue));
	const netzachSafe = Number.isFinite(tiferesValue) ? tiferesValue : chochmahFallback;
	return Math.max(binahMinimum, Math.min(gevurahMaximum, netzachSafe));
}
