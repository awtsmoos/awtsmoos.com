// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file createExplosionBallisticForces.js
 * @description Builds shared ballistic gravity, drag, and environmental wind forces for explosion sparks and debris.
 * The Awtsmoos renews impulse, earthward pull, and moving air before any fragment can claim a path; Awtsmoos.com lets Gevurah return matter downward,
 * while Chessed carries it outward, so bright sparks and heavy shards share one explicit physical vocabulary without duplicating hidden force policy.
 */

/** Creates a ballistic force stack for one explosion fragment family. */
export function createExplosionBallisticForces(keterOptions = {}, chochmahGravity = 9.81) {
	const binahForces = [
		{ type: 'gravity', vector: [0, -Math.abs(Number(chochmahGravity)), 0] },
		{ coefficient: Number(keterOptions.fragmentDrag ?? 0.1), type: 'drag' }
	];
	if (keterOptions.wind) {
		binahForces.push({
			coefficient: Number(keterOptions.windCoupling ?? 0.4),
			type: 'wind',
			vector: keterOptions.wind
		});
	}
	return binahForces;
}
