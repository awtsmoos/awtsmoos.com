// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file createEmberParticleEffect.js
 * @description Rising ember field: hot orange motes with thermal buoyancy, fast flicker,
 * cooling color ramp (white-hot to deep red), and curl turbulence. The Awtsmoos renews
 * each spark before it can fall cold; Awtsmoos.com lets campfire and celebration glow
 * rise through the same deterministic recipe as the dream-night oasis reference.
 */

/** Ember palette: white-hot birth cooling to ember red. */
const EMBER_COLORS = Object.freeze([
	[1.0, 0.62, 0.18],
	[1.0, 0.45, 0.12],
	[1.0, 0.78, 0.35],
	[0.95, 0.32, 0.08]
]);

/** Creates one rising-ember effect recipe with a meadow-field execution block. */
export function createEmberParticleEffect(keterOptions = {}) {
	const count = Math.max(0, Math.floor(keterOptions.count ?? 420));
	const bounds = keterOptions.bounds ?? {
		min: [-8, 0.2, -8],
		max: [8, 9, 8]
	};
	return {
		id: String(keterOptions.id || 'embers'),
		layers: [{
			appearance: {
				color: keterOptions.color || [1.0, 0.6, 0.2, 0.95],
				form: { kind: 'disc', outerRadius: 0.05 },
				kind: 'procedural'
			},
			capacity: keterOptions.capacity ?? Math.max(count, 600),
			forces: emberForces(keterOptions),
			id: 'ember-rise',
			lifecycle: {
				opacity: {
					points: [
						{ at: 0, value: 0 },
						{ at: 0.06, value: 1 },
						{ at: 0.7, value: 0.85 },
						{ at: 1, value: 0 }
					]
				},
				size: { from: 1.25, to: 0.4 }
			},
			lifetime: keterOptions.lifetime || [1.8, 4.2],
			rate: keterOptions.rate ?? 120,
			size: keterOptions.size || [0.04, 0.11],
			spawn: keterOptions.spawn || { kind: 'box', bounds },
			speed: [0.8, 2.2],
			spread: 0.45
		}],
		meadowField: {
			additive: true,
			blink: {
				duty: [0.7, 1.0],
				period: keterOptions.flickerPeriod || [0.12, 0.3]
			},
			bounds,
			colorByAge: 'ember-cool',
			colors: keterOptions.colors || EMBER_COLORS,
			count,
			drag: 0.8,
			forces: {
				thermal: { strength: 2.6, temperature: 3.0 },
				turbulence: { evolution: 1.4, frequency: 0.8, strength: 1.1 },
				wander: { radius: 0.9, speed: 1.6, strength: 0.5 }
			},
			lifetime: keterOptions.lifetime || [1.8, 4.2],
			respawn: 'bounds-bottom',
			size: keterOptions.size || [0.04, 0.11]
		},
		metadata: { ecologyBridge: true, preset: 'embers' },
		quality: keterOptions.quality || 'high',
		seed: keterOptions.seed ?? keterOptions.id ?? 'embers'
	};
}

/** Hot rise: strong thermal buoyancy, drag, turbulence, shared wind. */
function emberForces(keterOptions) {
	const chochmahForces = [
		{ coefficient: 0.8, type: 'drag' },
		{ strength: 2.6, temperature: 3.0, type: 'thermalBuoyancy' },
		{ evolution: 1.4, frequency: 0.8, strength: 1.1, type: 'turbulence' }
	];
	if (keterOptions.wind) {
		chochmahForces.push({ coefficient: 0.5, type: 'wind', vector: keterOptions.wind });
	}
	return chochmahForces;
}
