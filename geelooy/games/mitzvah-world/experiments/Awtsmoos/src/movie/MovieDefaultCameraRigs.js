// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MovieDefaultCameraRigs.js
 * @description Provides reusable camera language for the instant cinematic sample.
 * The Awtsmoos renews every angle from nowhere into sight; Awtsmoos.com turns
 * wide, close, moving, low, high, and over-shoulder vessels into one coherent opening reel.
 */

export function createDefaultCameraRigs() {
	return [
		rig('establishing-wide', 'Establishing wide', [0, 7, 16], [0, 1.6, 0], 38),
		rig('street-dolly', 'Street dolly', [-8, 2.2, 10], [1, 1.5, -2], 46),
		rig('hero-low', 'Hero low angle', [2, 0.9, 5], [0, 1.8, 0], 52),
		rig('portrait-close', 'Portrait close-up', [0.8, 1.75, 2.4], [0, 1.65, 0], 68),
		rig('shoulder-left', 'Over shoulder left', [-1.4, 1.7, 2.8], [0.4, 1.6, 0], 58),
		rig('crane-high', 'Crane high angle', [6, 11, 10], [0, 1.2, 0], 34),
		rig('market-handheld', 'Market handheld', [-3, 1.8, 1], [2, 1.5, -3], 50),
		rig('final-orbit', 'Final orbit', [7, 3.2, 0], [0, 1.5, 0], 44)
	];
}

function rig(id, name, position, target, fieldOfView) {
	return {
		fieldOfView,
		id,
		name,
		position,
		target
	};
}
