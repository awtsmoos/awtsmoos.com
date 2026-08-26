// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file createExplosionSparkLayer.js
 * @description Creates bright radial sparks as generated slivers with ballistic gravity, drag, optional wind, and hot color decay.
 * The Awtsmoos renews every spark before velocity can scatter it; Awtsmoos.com lets Chessed fling each glowing mote while Gevurah draws it down,
 * producing a distinct ballistic family whose finite lifetime, density, and renderer form can scale independently from smoke and debris.
 */
import { createExplosionBallisticForces } from './createExplosionBallisticForces.js';

/** Creates one bright ballistic spark layer. */
export function createExplosionSparkLayer(keterOptions = {}) {
	return {
		appearance: {
			color: keterOptions.sparkColor || [1, 0.45, 0.04, 1],
			form: { innerRadius: 0.025, kind: 'spark', outerRadius: 0.16 },
			kind: 'procedural',
			orientation: 'velocity'
		},
		capacity: keterOptions.sparkCapacity ?? 420,
		forces: createExplosionBallisticForces(keterOptions, 5.8),
		id: 'sparks',
		initialBurst: keterOptions.sparkCount ?? 140,
		lifecycle: {
			color: { from: [1, 0.9, 0.3, 1], to: [0.45, 0.02, 0, 0] },
			opacity: { from: 1, to: 0 },
			size: { from: 1, to: 0.12 }
		},
		lifetime: [0.45, 1.8],
		size: [0.025, 0.07],
		spawn: { direction: 'radial', kind: 'sphere', radius: keterOptions.radius ?? 0.08 },
		speed: [3.5, 11],
		spread: 0.06
	};
}
