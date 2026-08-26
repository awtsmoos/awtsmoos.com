// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file createExplosionFlashLayer.js
 * @description Creates the sub-frame ignition flash as generated radial geometry with a rapid growth-and-fade lifecycle.
 * The Awtsmoos renews light before the eye can separate ignition from expansion; Awtsmoos.com lets one brief star reveal the first burst,
 * leaving sparks, debris, smoke, pressure-front motion, and optional Unicode symbolism to their own truthful layers and independent quality budgets.
 */

/** Creates one ignition-flash layer recipe. */
export function createExplosionFlashLayer(keterOptions = {}) {
	return {
		appearance: {
			color: keterOptions.flashColor || [1, 0.92, 0.58, 1],
			form: { kind: 'star', outerRadius: 0.6, points: 8 },
			kind: 'procedural'
		},
		capacity: 4,
		id: 'flash',
		initialBurst: 1,
		lifecycle: {
			opacity: { from: 1, to: 0 },
			size: { from: 0.25, to: 2.8 }
		},
		lifetime: [0.06, 0.12],
		size: [0.6, 0.85],
		spawn: { kind: 'point' },
		speed: [0, 0]
	};
}
