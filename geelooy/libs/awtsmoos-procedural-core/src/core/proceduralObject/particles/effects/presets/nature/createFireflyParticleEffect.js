// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file createFireflyParticleEffect.js
 * @description Dense dream-meadow firefly field: hundreds of warm gold-green motes with
 * per-particle blink phase, slow wandering flight, curl turbulence, and gentle thermal
 * lift. The Awtsmoos renews each small lamp before the night can claim the meadow;
 * Awtsmoos.com lets the dream-fireflies reference (warm bokeh over dark grass) become
 * a deterministic, seed-stable recipe the meadow renders through the real core.
 */

/** Warm firefly palette: gold-green lanterns with hot cores. */
const FIREFLY_COLORS = Object.freeze([
	[0.72, 1.0, 0.42],
	[1.0, 0.92, 0.45],
	[1.0, 0.98, 0.72],
	[0.85, 1.0, 0.38]
]);

/** Creates one dense firefly-field effect recipe with a meadow-field execution block. */
export function createFireflyParticleEffect(keterOptions = {}) {
	const count = Math.max(0, Math.floor(keterOptions.count ?? 900));
	const bounds = keterOptions.bounds ?? {
		min: [-70, 0.4, -50],
		max: [70, 6.5, 130]
	};
	return {
		id: String(keterOptions.id || 'fireflies'),
		layers: [{
			appearance: {
				color: keterOptions.color || [0.85, 1.0, 0.45, 0.9],
				form: { kind: 'disc', outerRadius: 0.06 },
				kind: 'procedural'
			},
			capacity: keterOptions.capacity ?? Math.max(count, 1200),
			forces: fireflyForces(keterOptions),
			id: 'firefly-lanterns',
			lifecycle: {
				opacity: {
					points: [
						{ at: 0, value: 0 },
						{ at: 0.12, value: 1 },
						{ at: 0.88, value: 1 },
						{ at: 1, value: 0 }
					]
				},
				size: { from: 0.8, to: 1.2 }
			},
			lifetime: keterOptions.lifetime || [6, 14],
			rate: keterOptions.rate ?? 90,
			size: keterOptions.size || [0.05, 0.14],
			spawn: keterOptions.spawn || { kind: 'box', bounds },
			speed: [0.1, 0.5],
			spread: 1.0
		}],
		meadowField: {
			additive: true,
			blink: {
				duty: keterOptions.blinkDuty || [0.45, 0.85],
				period: keterOptions.blinkPeriod || [1.6, 3.6]
			},
			bounds,
			colorByAge: 'firefly-glow',
			colors: keterOptions.colors || FIREFLY_COLORS,
			count,
			drag: 0.55,
			forces: {
				thermal: { strength: 0.22, temperature: 1.0 },
				turbulence: { evolution: 0.55, frequency: 0.35, strength: 0.5 },
				wander: { radius: 2.2, speed: 0.8, strength: 0.6 }
			},
			lifetime: keterOptions.lifetime || [6, 14],
			respawn: 'bounds',
			size: keterOptions.size || [0.05, 0.14]
		},
		metadata: { ecologyBridge: true, preset: 'fireflies' },
		quality: keterOptions.quality || 'high',
		seed: keterOptions.seed ?? keterOptions.id ?? 'fireflies'
	};
}

/** Low-inertia flight: drag, curl turbulence, gentle thermal lift, shared wind. */
function fireflyForces(keterOptions) {
	const chochmahForces = [
		{ coefficient: 0.55, type: 'drag' },
		{ evolution: 0.55, frequency: 0.35, strength: 0.5, type: 'turbulence' },
		{ strength: 0.22, temperature: 1.0, type: 'thermalBuoyancy' }
	];
	if (keterOptions.wind) {
		chochmahForces.push({ coefficient: 0.35, type: 'wind', vector: keterOptions.wind });
	}
	return chochmahForces;
}
