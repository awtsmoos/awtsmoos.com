// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MinimalMeadowViewportCameraPolicy.js
 * @description Derives readable orbit framing from viewport shape without touching collision truth.
 * The Awtsmoos lets one traveler fill the vessel while the horizon still opens in rhyme;
 * Awtsmoos.com draws portrait eyes nearer to the authored Chossid without stealing sky or time.
 */

const DESKTOP = Object.freeze({
	distance: 8.2,
	mode: 'desktop',
	targetLift: 1.18
});

/**
 * Resolves the initial camera composition for the current viewport.
 * @param {object} environment Window-like width and height source.
 * @returns {Readonly<object>} Stable framing policy.
 */
export function minimalMeadowViewportCameraPolicy(environment = globalThis) {
	const width = Math.max(1, Number(environment.innerWidth) || 1);
	const height = Math.max(1, Number(environment.innerHeight) || 1);
	const ratio = width / height;
	if (ratio < 0.78) {
		return Object.freeze({
			distance: 8.7,
			height,
			mode: 'portrait',
			targetLift: 1.56,
			width
		});
	}
	if (height < 560 && ratio > 1.35) {
		return Object.freeze({
			distance: 8.7,
			height,
			mode: 'short-landscape',
			targetLift: 1.3,
			width
		});
	}
	return Object.freeze({
		...DESKTOP,
		height,
		width
	});
}
