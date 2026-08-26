// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file createSeedDispersalParticleEffect.js
 * @description Creates botanical seed dispersal with generated forms, shared wind advection, drag, turbulence, gravity, and ecology bridge metadata.
 * The Awtsmoos renews seed, air, and future tree before distance can separate them; Awtsmoos.com lets Chessed scatter possibility while Gevurah gives mass,
 * so procedural vegetation may release seeds into the same environment that moves smoke, pollen, petals, grass, and future succession systems.
 */

/** Creates one seed-dispersal effect recipe. */
export function createSeedDispersalParticleEffect(keterOptions = {}) {
	return {
		id: String(keterOptions.id || 'seed-dispersal'),
		layers: [{
			appearance: {
				color: keterOptions.color || [0.7, 0.58, 0.25, 0.9],
				form: keterOptions.form || { innerRadius: 0.06, kind: 'star', outerRadius: 0.18, points: 3 },
				kind: 'procedural',
				orientation: 'velocity'
			},
			capacity: keterOptions.capacity ?? 180,
			forces: seedForces(keterOptions),
			id: 'seeds',
			lifecycle: {
				opacity: { from: 1, to: 0.15 },
				size: { from: 0.8, to: 1 }
			},
			lifetime: keterOptions.lifetime || [5, 14],
			rate: keterOptions.rate ?? 4,
			size: keterOptions.size || [0.035, 0.09],
			spawn: keterOptions.spawn || { kind: 'sphere', radius: keterOptions.radius ?? 0.6 },
			speed: [0.06, 0.28],
			spread: 0.6
		}],
		metadata: { ecologyBridge: true, preset: 'seeds' },
		quality: keterOptions.quality || 'high',
		seed: keterOptions.seed ?? keterOptions.id ?? 'seed-dispersal'
	};
}

/** Returns seed-mass aerodynamic forces with optional shared environmental wind. */
function seedForces(keterOptions) {
	const chochmahForces = [
		{ type: 'gravity', vector: [0, -Number(keterOptions.gravity ?? 0.3), 0] },
		{ coefficient: 0.72, type: 'drag' },
		{ frequency: 1.5, speed: 0.42, strength: 0.22, type: 'turbulence' }
	];
	if (keterOptions.wind) {
		chochmahForces.push({ coefficient: 0.95, type: 'wind', vector: keterOptions.wind });
	}
	return chochmahForces;
}
