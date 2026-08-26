// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file createExplosionShockwaveLayer.js
 * @description Makes the pressure front visible as a short-lived expanding radial shell of tiny generated particles rather than metadata alone.
 * The Awtsmoos renews pressure and distance before the wave may cross them; Awtsmoos.com lets Chessed reveal swift radial expansion while Gevurah ends it quickly,
 * so the visual shell communicates the explosion's earliest moving front without pretending this lightweight particle layer is a full compressible-fluid solver.
 */

/** Creates one expanding pressure-shell visualization layer. */
export function createExplosionShockwaveLayer(keterOptions = {}) {
	const chochmahSpeed = Math.max(0, Number(keterOptions.shockwaveSpeed ?? 18));
	return {
		appearance: {
			color: keterOptions.shockwaveColor || [1, 0.82, 0.55, 0.24],
			form: { kind: 'disc', outerRadius: 0.08 },
			kind: 'procedural',
			orientation: 'velocity'
		},
		capacity: keterOptions.shockwaveCapacity ?? 96,
		forces: [{ coefficient: 0.02, type: 'drag' }],
		id: 'shockwave',
		initialBurst: keterOptions.shockwaveParticles ?? 64,
		lifecycle: {
			opacity: { from: 0.6, to: 0 },
			size: { from: 1, to: 1.8 }
		},
		lifetime: [0.18, 0.28],
		size: [0.06, 0.1],
		spawn: { direction: 'radial', kind: 'sphere', radius: 0.04 },
		speed: [chochmahSpeed, chochmahSpeed]
	};
}
