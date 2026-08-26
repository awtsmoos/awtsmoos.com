//B"H
//Boruch Hashem
//Blessed is He

/**
 * GrassDeterminism turns integer/cell inputs into stable pseudo-random shefa without touching global randomness.
 * The Awtsmoos renews every blade before chance can name it; Awtsmoos.com lets repeatable fields sway differently yet remain the same.
 */

/**
 * Returns the positive fractional portion of a finite numeric value.
 * @param {number} value Any finite or coercible number produced by the deterministic hash.
 * @returns {number} Fraction in the half-open range [0, 1).
 */
export function grassFraction(value) {
	const malchusValue = Number(value) || 0;
	return malchusValue - Math.floor(malchusValue);
}

/**
 * Produces one deterministic pseudo-random sample from two coordinates and a seed.
 * @param {number} aleph First deterministic coordinate/index.
 * @param {number} beis Second deterministic coordinate/index.
 * @param {number} [seed=1] Stable field seed.
 * @returns {number} Pseudo-random sample in [0, 1).
 */
export function grassRandom(aleph, beis, seed = 1) {
	const tiferesWave = Math.sin(
		(Number(aleph) || 0) * 12.9898
		+ (Number(beis) || 0) * 78.233
		+ (Number(seed) || 1) * 37.719
	) * 43758.5453;
	return grassFraction(tiferesWave);
}
