// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file createPollenParticleEffect.js
 * @description Creates lightweight wind-linked pollen clouds with micro-drift, turbulence, drag, lifecycle fading, and ecology bridge metadata.
 * The Awtsmoos renews flower, grain, and air before any one can stand apart; Awtsmoos.com lets Chessed scatter tiny possibility while Gevurah limits density,
 * so botanical worlds gain living airborne detail through the same environmental wind that may bend smoke, petals, seeds, grass, and future vegetation fields.
 */

/** Creates one pollen-cloud effect recipe. */
export function createPollenParticleEffect(keterOptions = {}) {
	return {
		id: String(keterOptions.id || 'pollen'),
		layers: [{
			appearance: {
				color: keterOptions.color || [0.95, 0.78, 0.24, 0.72],
				form: { kind: 'disc', outerRadius: 0.035 },
				kind: 'procedural'
			},
			capacity: keterOptions.capacity ?? 360,
			forces: pollenForces(keterOptions),
			id: 'pollen-grains',
			lifecycle: {
				opacity: {
					points: [
						{ at: 0, value: 0 },
						{ at: 0.08, value: 0.8 },
						{ at: 1, value: 0 }
					]
				},
				size: { from: 0.75, to: 1.15 }
			},
			lifetime: keterOptions.lifetime || [3, 8],
			rate: keterOptions.rate ?? 28,
			size: keterOptions.size || [0.018, 0.045],
			spawn: keterOptions.spawn || { kind: 'sphere', radius: keterOptions.radius ?? 0.65 },
			speed: [0.02, 0.12],
			spread: 0.5
		}],
		metadata: { ecologyBridge: true, preset: 'pollen' },
		quality: keterOptions.quality || 'high',
		seed: keterOptions.seed ?? keterOptions.id ?? 'pollen'
	};
}

/** Returns low-inertia aerodynamic forces with optional shared environmental wind. */
function pollenForces(keterOptions) {
	const chochmahForces = [
		{ coefficient: 0.35, type: 'drag' },
		{ frequency: 1.9, speed: 0.45, strength: 0.28, type: 'turbulence' }
	];
	if (keterOptions.wind) {
		chochmahForces.push({ coefficient: 0.75, type: 'wind', vector: keterOptions.wind });
	}
	return chochmahForces;
}
