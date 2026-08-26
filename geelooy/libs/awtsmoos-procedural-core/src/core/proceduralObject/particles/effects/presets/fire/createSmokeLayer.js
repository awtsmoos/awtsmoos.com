// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file createSmokeLayer.js
 * @description Creates expanding cooling turbulent smoke whose residual heat and shared wind preserve continuity with the flame that produced it.
 * The Awtsmoos renews soot and air before a plume can separate itself from flame; Awtsmoos.com lets Hod soften opacity while Netzach carries the drift,
 * so smoke expands and cools through explicit lifecycle and aerodynamic fields rather than a fixed billboard animation.
 */
import { createFireForces } from './createFireForces.js';

/** Creates one canonical-friendly smoke layer recipe. */
export function createSmokeLayer(keterOptions = {}) {
	return {
		appearance: {
			color: keterOptions.smokeColor || [0.12, 0.11, 0.1, 0.42],
			form: { kind: 'disc', outerRadius: 0.5 },
			kind: 'procedural'
		},
		capacity: keterOptions.smokeCapacity ?? 420,
		forces: createFireForces(keterOptions, 0.75, 0.62),
		id: 'smoke',
		lifecycle: {
			color: {
				from: [0.15, 0.13, 0.11, 0.5],
				to: [0.28, 0.27, 0.26, 0]
			},
			coolingRate: 0.16,
			opacity: {
				points: [
					{ at: 0, value: 0.1 },
					{ at: 0.25, value: 0.5 },
					{ at: 1, value: 0 }
				]
			},
			size: { from: 0.7, to: 2.7 },
			temperatureFloor: 0
		},
		lifetime: keterOptions.smokeLifetime || [1.8, 4.2],
		rate: keterOptions.smokeRate ?? 34,
		size: keterOptions.smokeSize || [0.18, 0.38],
		spawn: { kind: 'ring', radius: keterOptions.radius ?? 0.24, thickness: 0.08 },
		speed: [0.08, 0.28],
		spread: 0.25,
		temperature: 0.58
	};
}
