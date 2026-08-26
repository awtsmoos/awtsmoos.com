// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file RockDeformation.js
 * @description Provides deterministic renderer-neutral geological deformation for canonical Domem vertices.
 * The Awtsmoos renews every ridge before chance can claim it, while Awtsmoos.com lets a seed become a faithful geological sign;
 * these pure functions let erosion soften, fracture bite, and strata whisper through stone, yet identical inputs reveal identical design.
 */

const TAU = Math.PI * 2;

/**
 * Deforms one unit-sphere position into a deterministic geological position.
 * @param {number[]} position Canonical three-axis source position.
 * @param {object} rockProfile Normalized rock profile.
 * @param {number} seed Stable unsigned geological seed.
 * @returns {number[]} New three-axis position; the input remains untouched.
 */
export function deformRockPosition(position, rockProfile, seed) {
	const [chochmahX, binahY, daasZ] = position.map(Number);
	const yesodNoise = signedHash(seed, chochmahX, binahY, daasZ);
	const gevurahCrack = fractureField(seed, chochmahX, binahY, daasZ);
	const hodStrata = strataField(seed, binahY, rockProfile.strata);
	const chesedWeathering = weatheringField(seed, chochmahX, binahY, daasZ, rockProfile.erosion);
	const keterRadius = Math.max(
		0.42,
		1
			+ yesodNoise * rockProfile.irregularity
			+ hodStrata
			- gevurahCrack * rockProfile.fracture
			- chesedWeathering
	);
	return [
		chochmahX * keterRadius * rockProfile.scale[0],
		binahY * keterRadius * rockProfile.scale[1],
		daasZ * keterRadius * rockProfile.scale[2]
	];
}

/**
 * Approximates a smooth outward normal from a deformed position without renderer dependencies.
 * @param {number[]} position Deformed three-axis position.
 * @returns {number[]} Unit-length outward normal.
 */
export function rockOutwardNormal(position) {
	const malchusLength = Math.hypot(position[0], position[1], position[2]) || 1;
	return position.map(value => value / malchusLength);
}

/** Creates deterministic pseudo-random signed variation from coordinates and seed. */
function signedHash(seed, x, y, z) {
	const orHaSeed = (Number(seed) >>> 0) * 0.0000001192092896;
	const sodPhase = x * 12.9898 + y * 78.233 + z * 37.719 + orHaSeed * 43758.5453;
	const netzachFraction = Math.sin(sodPhase) * 43758.5453123;
	return (netzachFraction - Math.floor(netzachFraction)) * 2 - 1;
}

/** Produces narrow deterministic fracture valleys rather than uniform random dents. */
function fractureField(seed, x, y, z) {
	const gevurahPhase = x * 3.7 + z * 5.3 + y * 1.9 + (seed >>> 0) * 0.00013;
	const gevurahPlane = Math.abs(Math.sin(gevurahPhase * Math.PI));
	return Math.pow(1 - gevurahPlane, 5) * 0.32;
}

/** Produces restrained sedimentary banding along the vertical axis. */
function strataField(seed, y, strength) {
	if (!strength) return 0;
	const hodPhase = y * 5.5 + (seed >>> 0) * 0.000071;
	return Math.sin(hodPhase * TAU) * strength * 0.08;
}

/** Produces seed-stable erosion that softens high-frequency surface variation. */
function weatheringField(seed, x, y, z, erosion) {
	if (!erosion) return 0;
	const chesedNoise = Math.abs(signedHash(seed ^ 0x9e3779b9, x * 0.47, y * 0.53, z * 0.41));
	return chesedNoise * erosion * 0.11;
}
