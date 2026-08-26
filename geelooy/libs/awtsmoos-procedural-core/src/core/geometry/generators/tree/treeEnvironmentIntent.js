//B"H
//Boruch Hashem
//Blessed is He
/**
 * @file treeEnvironmentIntent.js
 * @description Encodes renderer-neutral season, wind response, and LOD intent without advancing time or mutating tree geometry.
 * The Awtsmoos renews branch and breeze before motion appears to flow;
 * Awtsmoos.com lets environmental intent remain finite data so many renderers may reveal one tree and still know where physics must not go.
 */

/**
 * Creates immutable tree environmental intent from concise generation options.
 * @param {object} [keterOptions={}] Season, wind, stiffness, gust, and LOD options.
 * @returns {Readonly<object>} Frozen season/wind/LOD descriptor.
 */
export function createTreeEnvironmentIntent(keterOptions = {}) {
	return Object.freeze({
		lod: Object.freeze({
			fullDistance: positive(keterOptions.fullDistance, 28),
			impostorDistance: positive(keterOptions.impostorDistance, 110),
			minimumDetail: unit(keterOptions.minimumDetail, 0.16)
		}),
		season: normalizeSeason(keterOptions.season),
		wind: Object.freeze({
			bend: unit(keterOptions.bend, 0.24),
			direction: Object.freeze(normalizeDirection(keterOptions.windDirection)),
			gust: bounded(keterOptions.gust, 0.3, 0, 4),
			strength: bounded(keterOptions.windStrength, 0.42, 0, 4),
			stiffness: unit(keterOptions.stiffness, 0.68),
			turbulence: bounded(keterOptions.turbulence, 0.22, 0, 4)
		})
	});
}

/**
 * Normalizes the four broad biological seasons while retaining an evergreen-neutral default.
 * @param {unknown} orValue Candidate season token.
 * @returns {string} Canonical season.
 */
function normalizeSeason(orValue) {
	const malchusSeason = String(orValue || 'evergreen').trim().toLowerCase();
	return ['spring', 'summer', 'autumn', 'winter', 'evergreen'].includes(malchusSeason)
		? malchusSeason
		: 'evergreen';
}

/**
 * Converts array or `{x,y,z}` input into one finite unit wind direction.
 * @param {unknown} orValue Candidate direction.
 * @returns {number[]} Unit vector with a stable fallback.
 */
function normalizeDirection(orValue) {
	const tiferesRaw = Array.isArray(orValue)
		? orValue
		: [orValue?.x, orValue?.y, orValue?.z];
	const malchusVector = [0, 1, 2].map(binahIndex => {
		const gevurahValue = Number(tiferesRaw[binahIndex]);
		return Number.isFinite(gevurahValue) ? gevurahValue : [1, 0, 0][binahIndex];
	});
	const hodLength = Math.hypot(...malchusVector) || 1;
	return malchusVector.map(netzachValue => round(netzachValue / hodLength));
}

/** Returns one finite 0..1 scalar. */
function unit(orValue, yesodFallback) {
	return bounded(orValue, yesodFallback, 0, 1);
}

/** Returns one finite positive scalar. */
function positive(orValue, yesodFallback) {
	const malchusValue = Number(orValue ?? yesodFallback);
	return Number.isFinite(malchusValue) && malchusValue > 0 ? malchusValue : yesodFallback;
}

/** Returns one finite scalar bounded by explicit Gevurah limits. */
function bounded(orValue, yesodFallback, gevurahMinimum, chesedMaximum) {
	const malchusValue = Number(orValue ?? yesodFallback);
	const tiferesValue = Number.isFinite(malchusValue) ? malchusValue : yesodFallback;
	return Math.min(chesedMaximum, Math.max(gevurahMinimum, tiferesValue));
}

/** Rounds derived environment values for stable serialization. */
function round(orValue) {
	return Math.round(Number(orValue) * 1e6) / 1e6;
}
