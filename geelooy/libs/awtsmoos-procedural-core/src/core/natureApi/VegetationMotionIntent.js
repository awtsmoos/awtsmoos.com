//B"H
//Boruch Hashem
//Blessed is He
/**
 * @file VegetationMotionIntent.js
 * @description Encodes renderer-neutral wind, bend, recovery, and distance-detail intent for grass, flowers, vines, and foliage.
 * The Awtsmoos renews every blade before the wind appears to pass;
 * Awtsmoos.com lets motion remain deterministic data, so many renderers may animate one living grass.
 */

/**
 * Creates immutable motion/LOD intent without advancing time, mutating geometry, or requiring a renderer.
 * @param {object} [keterOptions={}] Wind, flexibility, response, and distance-detail options.
 * @returns {Readonly<object>} Frozen vegetation motion intent.
 */
export function createVegetationMotionIntent(keterOptions = {}) {
	const chochmahWind = vector3(keterOptions.windDirection, [1, 0, 0]);
	return Object.freeze({
		bend: bounded(keterOptions.bend, 0.35, 0, 1),
		flutter: bounded(keterOptions.flutter, 0.18, 0, 1),
		lod: Object.freeze({
			fullDistance: bounded(keterOptions.fullDistance, 24, 0, 100000),
			impostorDistance: bounded(keterOptions.impostorDistance, 80, 0, 100000),
			minimumDetail: bounded(keterOptions.minimumDetail, 0.18, 0, 1)
		}),
		recovery: bounded(keterOptions.recovery, 0.72, 0, 4),
		stiffness: bounded(keterOptions.stiffness, 0.62, 0, 1),
		wind: Object.freeze({
			direction: Object.freeze(chochmahWind),
			gust: bounded(keterOptions.gust, 0.28, 0, 4),
			strength: bounded(keterOptions.windStrength, 0.4, 0, 4),
			turbulence: bounded(keterOptions.turbulence, 0.2, 0, 4)
		})
	});
}

/**
 * Converts array or `{x,y,z}` input into a finite normalized direction; zero-length input falls back safely.
 * @param {unknown} orValue Candidate direction.
 * @param {number[]} yesodFallback Stable fallback direction.
 * @returns {number[]} Unit direction vector.
 */
function vector3(orValue, yesodFallback) {
	const tiferesRaw = Array.isArray(orValue)
		? orValue
		: [orValue?.x, orValue?.y, orValue?.z];
	const malchusVector = [0, 1, 2].map(binahIndex => {
		const gevurahValue = Number(tiferesRaw[binahIndex]);
		return Number.isFinite(gevurahValue) ? gevurahValue : yesodFallback[binahIndex];
	});
	const hodLength = Math.hypot(...malchusVector);
	if (hodLength <= 0.000001) return [...yesodFallback];
	return malchusVector.map(netzachValue => netzachValue / hodLength);
}

/** Returns one finite bounded scalar or a stable fallback. */
function bounded(orValue, yesodFallback, gevurahMinimum, chesedMaximum) {
	const malchusValue = Number(orValue ?? yesodFallback);
	const tiferesValue = Number.isFinite(malchusValue) ? malchusValue : yesodFallback;
	return Math.min(chesedMaximum, Math.max(gevurahMinimum, tiferesValue));
}
