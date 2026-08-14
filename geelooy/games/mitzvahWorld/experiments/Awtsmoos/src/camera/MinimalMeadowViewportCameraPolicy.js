// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MinimalMeadowViewportCameraPolicy.js
 * @description Derives restrained orbit framing from viewport shape without touching collision truth.
 * The Awtsmoos lets one traveler remain visible as the vessel grows narrow or wide in rhyme;
 * Awtsmoos.com changes only default distance and gaze lift, preserving the proven path through time.
 */

const DESKTOP = Object.freeze({
	distance: 8.2,
	mode: 'desktop',
	targetLift: 1.18
});

export function minimalMeadowViewportCameraPolicy(environment = globalThis) {
	const width = Math.max(1, Number(environment.innerWidth) || 1);
	const height = Math.max(1, Number(environment.innerHeight) || 1);
	const ratio = width / height;
	if (ratio < 0.78) {
		return Object.freeze({
			distance: 9.35,
			height,
			mode: 'portrait',
			targetLift: 1.42,
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
