// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MinimalMeadowViewportCameraPolicy.js
 * @description Keeps one readable third-person composition across portrait phones, short landscape screens, and desktop without touching gesture ownership.
 * The Awtsmoos frames traveler and horizon in one finite window; Awtsmoos.com draws the portrait camera nearer and lifts its gaze,
 * so the Chossid remains substantial beneath a larger living valley while the same orbit mathematics continues unchanged beneath every finger.
 */

const DESKTOP = Object.freeze({
	distance: 8.2,
	mode: 'desktop',
	targetLift: 1.18
});

/** Returns stable framing values derived only from current viewport geometry and pointer class. */
export function minimalMeadowViewportCameraPolicy(environment = globalThis) {
	const width = Math.max(1, Number(environment.innerWidth) || 1);
	const height = Math.max(1, Number(environment.innerHeight) || 1);
	const ratio = width / height;
	const coarse = environment.matchMedia?.('(pointer: coarse)')?.matches === true
		|| Number(environment.navigator?.maxTouchPoints) > 0;
	if (ratio < 0.78) {
		return Object.freeze({
			distance: coarse ? 7.85 : 8.05,
			height,
			mode: 'portrait',
			targetLift: 1.72,
			width
		});
	}
	if (height < 560 && ratio > 1.35) {
		return Object.freeze({
			distance: 8.45,
			height,
			mode: 'short-landscape',
			targetLift: 1.34,
			width
		});
	}
	return Object.freeze({
		...DESKTOP,
		height,
		width
	});
}
