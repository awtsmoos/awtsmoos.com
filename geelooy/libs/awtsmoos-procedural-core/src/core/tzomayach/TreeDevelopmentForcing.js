// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file TreeDevelopmentForcing.js
 * @description Blends environmental development signals into the canonical tree generator's existing global-force vocabulary.
 * The Awtsmoos renews sun, gravity, wind, and branch in one indivisible now; Awtsmoos.com lets those apparent directions enter one bounded vector,
 * so Chessed may reach toward light while Gevurah keeps force finite and the canonical skeleton remains the sole tree beneath every LOD.
 */

/** Combines preset force with light, gravity, wind, apical dominance, and crown competition. */
export function createTreeDevelopmentForce(branch = {}, development = {}) {
	const keterExisting = weightedVector(
		branch.force?.direction || { x: 0, y: 1, z: 0 },
		finite(branch.force?.strength, 0)
	);
	const chochmahLight = weightedVector(
		development.lightDirection,
		0.032 * development.phototropism
	);
	const binahGravity = weightedVector(
		{ x: 0, y: 1, z: 0 },
		0.026 * development.gravitropism * (0.55 + development.apicalDominance * 0.45)
	);
	const gevurahCompetition = weightedVector(
		{ x: 0, y: 1, z: 0 },
		0.024 * development.spaceCompetition
	);
	const netzachWind = weightedVector(
		development.windDirection,
		0.022 * development.windResponse
	);
	const tiferesVector = addVectors(
		keterExisting,
		chochmahLight,
		binahGravity,
		gevurahCompetition,
		netzachWind
	);
	const yesodStrength = clamp(vectorLength(tiferesVector), 0, 0.14);
	const malchusDirection = normalizedVector(tiferesVector, { x: 0, y: 1, z: 0 });
	return Object.freeze({
		direction: Object.freeze(malchusDirection),
		strength: yesodStrength
	});
}

/** Returns the developmental multiplier for branch divergence angle at one non-trunk level. */
export function treeDevelopmentAngleScale(development) {
	return clamp(
		1
		+ development.edgeExposure * 0.16
		- development.spaceCompetition * 0.18
		- development.apicalDominance * 0.05,
		0.72,
		1.22
	);
}

/** Returns the developmental multiplier for branch irregularity and weather-shaped character. */
export function treeDevelopmentGnarlinessScale(development) {
	return clamp(
		0.9
		+ development.windResponse * 0.34
		+ (1 - development.vigor) * 0.16
		+ development.age * 0.12,
		0.82,
		1.42
	);
}

function weightedVector(value, weight) {
	const vector = normalizedVector(value, { x: 0, y: 0, z: 0 });
	return { x: vector.x * weight, y: vector.y * weight, z: vector.z * weight };
}

function addVectors(...vectors) {
	return vectors.reduce((sum, vector) => ({
		x: sum.x + vector.x,
		y: sum.y + vector.y,
		z: sum.z + vector.z
	}), { x: 0, y: 0, z: 0 });
}

function normalizedVector(value, fallback) {
	const vector = asVector(value, fallback);
	const length = vectorLength(vector);
	if (length < 1e-9) return { ...fallback };
	return { x: vector.x / length, y: vector.y / length, z: vector.z / length };
}

function asVector(value, fallback) {
	if (Array.isArray(value)) {
		return { x: finite(value[0], 0), y: finite(value[1], 0), z: finite(value[2], 0) };
	}
	return {
		x: finite(value?.x, fallback.x),
		y: finite(value?.y, fallback.y),
		z: finite(value?.z, fallback.z)
	};
}

function vectorLength(vector) {
	return Math.hypot(vector.x, vector.y, vector.z);
}

function finite(value, fallback) {
	return Number.isFinite(Number(value)) ? Number(value) : fallback;
}

function clamp(value, minimum, maximum) {
	return Math.max(minimum, Math.min(maximum, value));
}
