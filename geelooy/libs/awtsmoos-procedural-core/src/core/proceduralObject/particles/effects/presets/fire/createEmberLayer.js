// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file createEmberLayer.js
 * @description Creates inertial glowing embers as generated spark geometry with gravity, drag, turbulence, wind response, and hot color decay.
 * The Awtsmoos renews falling coal and rising spark in one present; Awtsmoos.com lets Gevurah give the ember weight while Chessed lets hot fragments escape,
 * so fire carries both upward turbulent light and believable ballistic fragments instead of one uniform particle family.
 */

/** Creates one canonical-friendly ember layer recipe. */
export function createEmberLayer(keterOptions = {}) {
	return {
		appearance: {
			color: keterOptions.emberColor || [1, 0.3, 0.02, 1],
			form: { innerRadius: 0.04, kind: 'spark', outerRadius: 0.18 },
			kind: 'procedural',
			orientation: 'velocity'
		},
		capacity: keterOptions.emberCapacity ?? 180,
		forces: emberForces(keterOptions),
		id: 'embers',
		lifecycle: {
			color: { from: [1, 0.8, 0.18, 1], to: [0.5, 0.02, 0, 0] },
			opacity: { from: 1, to: 0 },
			size: { from: 1, to: 0.25 }
		},
		lifetime: [0.9, 2.4],
		rate: keterOptions.emberRate ?? 14,
		size: [0.035, 0.08],
		spawn: { direction: 'radial', kind: 'sphere', radius: keterOptions.radius ?? 0.18 },
		speed: [0.8, 2.5],
		spread: 0.12
	};
}

/** Returns ballistic ember forces with optional shared environmental wind. */
function emberForces(keterOptions) {
	const chochmahForces = [
		{ type: 'gravity', vector: [0, -2.4, 0] },
		{ coefficient: 0.18, type: 'drag' },
		{ frequency: 1.7, strength: 0.28, type: 'turbulence' }
	];
	if (keterOptions.wind) {
		chochmahForces.push({ coefficient: 0.55, type: 'wind', vector: keterOptions.wind });
	}
	return chochmahForces;
}
