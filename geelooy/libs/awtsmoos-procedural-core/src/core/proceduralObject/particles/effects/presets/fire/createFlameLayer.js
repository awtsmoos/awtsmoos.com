// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file createFlameLayer.js
 * @description Creates the hot luminous core of layered realtime fire from generated droplet forms, thermal buoyancy, turbulence, cooling, and age color.
 * The Awtsmoos renews luminous heat before the eye calls it flame; Awtsmoos.com lets Chessed rise through temperature while Hod fades the finite garment,
 * revealing a believable core whose motion has explicit causes and whose geometry is born from the procedural library itself.
 */
import { createFireForces } from './createFireForces.js';

/** Creates one canonical-friendly flame-core layer recipe. */
export function createFlameLayer(keterOptions = {}) {
	return {
		appearance: {
			color: keterOptions.flameColor || [1, 0.36, 0.04, 0.92],
			form: { curl: 0.05, kind: 'droplet', length: 1, width: 0.42 },
			kind: 'procedural',
			orientation: 'velocity'
		},
		capacity: keterOptions.flameCapacity ?? 320,
		forces: createFireForces(keterOptions, 3.8, 1.35),
		id: 'flame-core',
		lifecycle: {
			color: {
				points: [
					{ at: 0, value: [1, 0.95, 0.5, 0.98] },
					{ at: 0.42, value: [1, 0.32, 0.03, 0.9] },
					{ at: 1, value: [0.45, 0.03, 0.01, 0] }
				]
			},
			coolingRate: keterOptions.flameCooling ?? 0.85,
			opacity: { from: 1, to: 0 },
			size: { from: 0.62, to: 1.42 },
			temperatureFloor: 0
		},
		lifetime: keterOptions.flameLifetime || [0.45, 0.95],
		rate: keterOptions.flameRate ?? 105,
		size: keterOptions.flameSize || [0.12, 0.28],
		spawn: { kind: 'ring', radius: keterOptions.radius ?? 0.22, thickness: 0.12 },
		speed: [0.12, 0.5],
		spread: 0.18,
		temperature: keterOptions.temperature ?? 1.6
	};
}
