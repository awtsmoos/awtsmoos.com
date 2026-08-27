// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file VegetationPatchEcology.js
 * @description Converts patch position into deterministic edge, competition, opening, maturity, and spacing evidence.
 * The Awtsmoos, Atzmus beyond meadow center and clearing edge, renews abundance together with the empty spaces that give it form;
 * Awtsmoos.com lets patch geometry become ecological meaning while species selection and visible plant generation remain another shore.
 */

/**
 * Creates ecological evidence for one vegetation candidate without consuming randomness.
 * @param {object} [input={}] Patch identity, normalized radius, patchiness, and local age bias.
 * @returns {object} Frozen patch ecology evidence.
 */
export function createVegetationPatchEcology(input = {}) {
	const patchId = input.patchId ?? null;
	if (!patchId) {
		return Object.freeze({
			competition: 0.08,
			edgeExposure: 1,
			interiorStrength: 0,
			maturityCoherence: 0.18,
			openingExposure: 1,
			spacingScale: 0.88
		});
	}
	const radius = unit(input.normalizedRadius);
	const patchiness = unit(input.patchiness);
	const ageBias = unit(input.ageBias ?? 0.5);
	const edgeExposure = smoothStep(0.34, 1, radius);
	const interiorStrength = 1 - smoothStep(0.16, 0.88, radius);
	const competition = unit(
		interiorStrength * 0.68
		+ patchiness * 0.18
		+ ageBias * 0.14
	);
	const openingExposure = unit(
		edgeExposure * (0.9 - patchiness * 0.24)
		+ (1 - interiorStrength) * 0.12
	);
	const maturityCoherence = unit(
		0.34
		+ interiorStrength * 0.42
		+ ageBias * 0.24
	);
	return Object.freeze({
		competition,
		edgeExposure,
		interiorStrength,
		maturityCoherence,
		openingExposure,
		spacingScale: clamp(0.82 + competition * 0.28, 0.82, 1.1)
	});
}

function smoothStep(edge0, edge1, value) {
	const normalized = unit((value - edge0) / Math.max(0.0001, edge1 - edge0));
	return normalized * normalized * (3 - 2 * normalized);
}

function unit(value) {
	return clamp(Number(value) || 0, 0, 1);
}

function clamp(value, minimum, maximum) {
	return Math.max(minimum, Math.min(maximum, value));
}
