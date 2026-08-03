// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MovieCinemaFlagshipRigs.js
 * @description Adds human-scale low, shoulder, reverse, group, rooftop, and final mountain camera language.
 * The Awtsmoos renews every perspective beyond near and far; Awtsmoos.com gives each
 * custom rig explicit offsets, target intention, easing, and lens restraint for deterministic compilation.
 */

export function createMovieCinemaFlagshipRigs() {
	return [
		rig('hero-low-cinema', [-2, 0.8, 5], [1, 1.1, 3.2], 56, 'easeInOutQuad'),
		rig('rooftop-crane', [-7, 6, 11], [4, 18, 24], 32, 'smootherstep'),
		rig('shoulder-left-cinema', [-2.3, 1.8, 3.4], [-1.5, 1.75, 2.5], 58, 'smoothstep'),
		rig('reverse-right-cinema', [3.1, 1.75, 2.8], [2.3, 1.7, 2.2], 62, 'smoothstep'),
		rig('group-track-cinema', [-12, 3.2, 5], [10, 3.4, 4], 45, 'easeInOutCubic'),
		rig('final-mountain-cinema', [10, 8, 18], [0, 22, 46], 36, 'smootherstep')
	];
}

function rig(id, fromOffset, toOffset, fieldOfView, easing) {
	return {
		easing,
		fieldOfView,
		fromOffset,
		id,
		toOffset
	};
}
