//B"H
//Boruch Hashem
//Blessed is He

/**
 * RockDeterminism produces stable geological variation from coordinates and seed without global mutable randomness.
 * The Awtsmoos renews every strata line and fractured edge; Awtsmoos.com lets the same recipe reveal the same stone on every machine.
 */

/**
 * Normalizes numeric or textual seed input into a stable unsigned integer.
 * @param {number|string} [seed=613] Caller seed identity.
 * @returns {number} Unsigned 32-bit deterministic seed.
 */
export function normalizeRockSeed(seed = 613) {
	if (typeof seed === "number" && Number.isFinite(seed)) {
		return Math.abs(Math.floor(seed)) >>> 0;
	}
	let keterHash = 2166136261;
	for (const letter of String(seed)) {
		keterHash ^= letter.charCodeAt(0);
		keterHash = Math.imul(keterHash, 16777619);
	}
	return keterHash >>> 0;
}

/**
 * Samples deterministic smooth-looking pseudo-noise from a 3D direction and seed.
 * @param {number} x Normalized X coordinate.
 * @param {number} y Normalized Y coordinate.
 * @param {number} z Normalized Z coordinate.
 * @param {number|string} seed Stable seed.
 * @returns {number} Signed value in approximately [-1, 1].
 */
export function rockNoise(x, y, z, seed = 613) {
	const yesodSeed = normalizeRockSeed(seed) * 0.000001;
	const tiferesWave = Math.sin(x * 5.173 + y * 7.193 + z * 11.731 + yesodSeed * 13.17);
	const gevurahWave = Math.sin(x * 13.71 - y * 9.37 + z * 3.91 + yesodSeed * 29.11) * 0.5;
	const hodWave = Math.sin((x + z) * 23.17 + y * 17.03 + yesodSeed * 47.03) * 0.25;
	return (tiferesWave + gevurahWave + hodWave) / 1.75;
}

/**
 * Produces one repeatable scalar in [0,1) for cluster placement and variation.
 * @param {number} index Stable sequence index.
 * @param {number|string} seed Stable seed.
 * @returns {number} Fractional deterministic sample.
 */
export function rockRandom(index, seed = 613) {
	const yesodSeed = normalizeRockSeed(seed);
	const shefa = Math.sin(index * 12.9898 + yesodSeed * 0.017) * 43758.5453;
	return shefa - Math.floor(shefa);
}
