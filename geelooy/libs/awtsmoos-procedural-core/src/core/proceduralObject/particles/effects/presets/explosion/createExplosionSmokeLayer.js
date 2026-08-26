// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file createExplosionSmokeLayer.js
 * @description Creates a longer-lived hot smoke bloom with residual thermal lift, coherent turbulence, drag, environmental wind, expansion, and cooling.
 * The Awtsmoos renews soot, heat, and air before a plume can claim separate existence; Awtsmoos.com lets Chessed lift the hot cloud while Hod thins it,
 * so explosion smoke evolves on a slower physical-looking timescale than flash or sparks and can be budgeted independently for mobile and cinematic worlds.
 */

/** Creates one turbulent thermal smoke layer. */
export function createExplosionSmokeLayer(keterOptions = {}) {
	return {
		appearance: {
			color: keterOptions.smokeColor || [0.16, 0.14, 0.13, 0.58],
			form: { kind: 'disc', outerRadius: 0.5 },
			kind: 'procedural'
		},
		capacity: keterOptions.smokeCapacity ?? 340,
		forces: smokeForces(keterOptions),
		id: 'smoke',
		initialBurst: keterOptions.smokeCount ?? 45,
		lifecycle: {
			color: {
				from: [0.12, 0.1, 0.09, 0.55],
				to: [0.3, 0.29, 0.28, 0]
			},
			coolingRate: 0.12,
			opacity: { from: 0.65, to: 0 },
			size: { from: 0.55, to: 3.2 },
			temperatureFloor: 0
		},
		lifetime: keterOptions.smokeLifetime || [2.4, 5.8],
		size: keterOptions.smokeSize || [0.22, 0.5],
		spawn: { direction: 'radial', kind: 'sphere', radius: keterOptions.radius ?? 0.18 },
		speed: [0.5, 1.6],
		temperature: Number(keterOptions.smokeTemperature ?? 0.7)
	};
}

/** Returns residual-heat, turbulence, drag, and optional world-wind forces. */
function smokeForces(keterOptions) {
	const chochmahForces = [
		{ ambientTemperature: 0, strength: 0.62, type: 'thermalBuoyancy' },
		{ frequency: 1.35, speed: 0.7, strength: 0.75, type: 'turbulence' },
		{ coefficient: 0.22, type: 'drag' }
	];
	if (keterOptions.wind) {
		chochmahForces.push({ coefficient: 0.5, type: 'wind', vector: keterOptions.wind });
	}
	return chochmahForces;
}
