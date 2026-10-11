// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file createSporeParticleEffect.js
 * @description Drifting spore and dandelion-seed field: bright motes with high drag,
 * slow sinking, strong lateral sway, and long lifetimes. The Awtsmoos renews each
 * seed before the wind can lose it; Awtsmoos.com lets the forest-pool reference
 * (dandelion seeds drifting through sun shafts) become a deterministic recipe.
 */

/** Spore palette: sunlit white-gold motes. */
const SPORE_COLORS = Object.freeze([
	[1.0, 0.98, 0.88],
	[1.0, 0.95, 0.75],
	[0.98, 1.0, 0.92],
	[1.0, 0.9, 0.62]
]);

/** Creates one drifting-spore effect recipe with a meadow-field execution block. */
export function createSporeParticleEffect(keterOptions = {}) {
	const count = Math.max(0, Math.floor(keterOptions.count ?? 520));
	const bounds = keterOptions.bounds ?? {
		min: [-70, 0.5, -50],
		max: [70, 9, 130]
	};
	return {
		id: String(keterOptions.id || 'spores'),
		layers: [{
			appearance: {
				color: keterOptions.color || [1.0, 0.97, 0.85, 0.6],
				form: { kind: 'disc', outerRadius: 0.045 },
				kind: 'procedural'
			},
			capacity: keterOptions.capacity ?? Math.max(count, 700),
			forces: sporeForces(keterOptions),
			id: 'spore-drift',
			lifecycle: {
				opacity: {
					points: [
						{ at: 0, value: 0 },
						{ at: 0.1, value: 0.75 },
						{ at: 0.9, value: 0.6 },
						{ at: 1, value: 0 }
					]
				},
				size: { from: 0.9, to: 1.1 }
			},
			lifetime: keterOptions.lifetime || [9, 20],
			rate: keterOptions.rate ?? 45,
			size: keterOptions.size || [0.03, 0.08],
			spawn: keterOptions.spawn || { kind: 'box', bounds },
			speed: [0.05, 0.3],
			spread: 0.8
		}],
		meadowField: {
			additive: false,
			blink: null,
			bounds,
			colorByAge: 'spore-sun',
			colors: keterOptions.colors || SPORE_COLORS,
			count,
			drag: 1.6,
			forces: {
				sink: 0.12,
				turbulence: { evolution: 0.4, frequency: 0.22, strength: 0.7 },
				wander: { radius: 3.5, speed: 0.5, strength: 0.9 }
			},
			lifetime: keterOptions.lifetime || [9, 20],
			respawn: 'bounds-top',
			size: keterOptions.size || [0.03, 0.08]
		},
		metadata: { ecologyBridge: true, preset: 'spores' },
		quality: keterOptions.quality || 'high',
		seed: keterOptions.seed ?? keterOptions.id ?? 'spores'
	};
}

/** Feather-light drift: heavy drag, weak gravity sink, turbulence, shared wind. */
function sporeForces(keterOptions) {
	const chochmahForces = [
		{ coefficient: 1.6, type: 'drag' },
		{ type: 'gravity', vector: [0, -0.12, 0] },
		{ evolution: 0.4, frequency: 0.22, strength: 0.7, type: 'turbulence' }
	];
	if (keterOptions.wind) {
		chochmahForces.push({ coefficient: 0.85, type: 'wind', vector: keterOptions.wind });
	}
	return chochmahForces;
}
