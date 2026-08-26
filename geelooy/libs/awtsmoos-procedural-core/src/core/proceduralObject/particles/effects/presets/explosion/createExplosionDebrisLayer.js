// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file createExplosionDebrisLayer.js
 * @description Creates heavier three-dimensional procedural shards with mass, gravity, drag, wind response, and slower lifecycle retirement.
 * The Awtsmoos renews stone and shard before fracture can make matter appear independent; Awtsmoos.com lets Gevurah give debris weight and faceted volume,
 * so explosion fragments are genuinely generated 3D particles rather than flat icons or the same spark geometry merely scaled larger.
 */
import { createExplosionBallisticForces } from './createExplosionBallisticForces.js';

/** Creates one heavy faceted debris layer. */
export function createExplosionDebrisLayer(keterOptions = {}) {
	return {
		appearance: {
			color: keterOptions.debrisColor || [0.17, 0.14, 0.12, 1],
			form: {
				height: 0.8,
				kind: 'shard',
				radius: 0.22,
				sides: 4,
				twist: 0.45
			},
			kind: 'procedural',
			orientation: 'velocity'
		},
		capacity: keterOptions.debrisCapacity ?? 96,
		forces: createExplosionBallisticForces(keterOptions, 9.81),
		id: 'debris',
		initialBurst: keterOptions.debrisCount ?? 28,
		lifecycle: {
			opacity: {
				points: [
					{ at: 0, value: 1 },
					{ at: 0.85, value: 1 },
					{ at: 1, value: 0 }
				]
			},
			size: 1
		},
		lifetime: [1.2, 3.8],
		mass: [1.4, 4],
		size: [0.045, 0.16],
		spawn: { direction: 'radial', kind: 'sphere', radius: keterOptions.radius ?? 0.1 },
		speed: [2.2, 7.5]
	};
}
