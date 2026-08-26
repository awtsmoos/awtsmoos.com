// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file createPetalParticleEffect.js
 * @description Creates wind-responsive falling petals with generated organic geometry, weak gravity, aerodynamic drag, turbulence, and gentle fading.
 * The Awtsmoos renews blossom and breeze before a petal can drift; Awtsmoos.com lets Netzach carry the living contour while Hod yields it to moving air,
 * giving flowering trees and plants a reusable seasonal effect that shares environmental forces instead of inventing a private animation current.
 */

/** Creates one generated petal-fall effect recipe. */
export function createPetalParticleEffect(keterOptions = {}) {
	return {
		id: String(keterOptions.id || 'petal-fall'),
		layers: [{
			appearance: {
				color: keterOptions.color || [1, 0.55, 0.72, 0.92],
				form: { curl: 0.08, kind: 'petal', length: 0.9, segments: 7, width: 0.42 },
				kind: 'procedural',
				orientation: 'velocity'
			},
			capacity: keterOptions.capacity ?? 260,
			forces: petalForces(keterOptions),
			id: 'petals',
			lifecycle: {
				opacity: {
					points: [
						{ at: 0, value: 0 },
						{ at: 0.05, value: 1 },
						{ at: 0.9, value: 1 },
						{ at: 1, value: 0 }
					]
				},
				size: 1
			},
			lifetime: keterOptions.lifetime || [4, 10],
			rate: keterOptions.rate ?? 8,
			size: keterOptions.size || [0.06, 0.14],
			spawn: keterOptions.spawn || { kind: 'sphere', radius: keterOptions.radius ?? 1.2 },
			speed: [0.02, 0.16],
			spread: 0.7
		}],
		metadata: { ecologyBridge: true, preset: 'petals' },
		quality: keterOptions.quality || 'high',
		seed: keterOptions.seed ?? keterOptions.id ?? 'petal-fall'
	};
}

/** Returns weak-gravity aerodynamic forces with optional shared environmental wind. */
function petalForces(keterOptions) {
	const chochmahForces = [
		{ type: 'gravity', vector: [0, -Number(keterOptions.gravity ?? 0.65), 0] },
		{ coefficient: 0.62, type: 'drag' },
		{ frequency: 1.25, speed: 0.55, strength: 0.35, type: 'turbulence' }
	];
	if (keterOptions.wind) {
		chochmahForces.push({ coefficient: 0.82, type: 'wind', vector: keterOptions.wind });
	}
	return chochmahForces;
}
