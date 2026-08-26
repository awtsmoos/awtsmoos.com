// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file VegetationPatchEcology.js
 * @description Converts patch position into immutable edge, competition, opening, maturity, and spacing evidence with optional neutral ecology controls.
 * The Awtsmoos renews crowded root and open edge together before either receives a measured score;
 * Awtsmoos.com lets expert ecology deepen the same old equations while callers with no new controls receive the exact legacy shore.
 */

/**
 * Creates ecological evidence for one vegetation candidate without consuming randomness.
 * @param {object} [input={}] Patch identity, radius, patchiness, age bias, and optional normalized controls.
 * @returns {Readonly<object>} Frozen patch ecology evidence.
 */
export function createVegetationPatchEcology(input = {}) {
	const patchId = input.patchId ?? null;
	if (!patchId) return legacyUniformEcology();
	const radius = unit(input.normalizedRadius);
	const patchiness = unit(input.patchiness);
	const ageBias = unit(input.ageBias ?? 0.5);
	const controls = input.controls ?? {};
	const edgeExposure = controlledEdgeExposure(radius, controls.edgeFalloff);
	const interiorStrength = 1 - smoothStep(0.16, 0.88, radius);
	const legacyCompetition = unit(
		interiorStrength * 0.68
		+ patchiness * 0.18
		+ ageBias * 0.14
	);
	const competition = blendControl(legacyCompetition, controls.competition, 0.28);
	const openingExposure = unit(
		edgeExposure * (0.9 - patchiness * 0.24)
		+ (1 - interiorStrength) * 0.12
	);
	const legacyMaturity = unit(
		0.34
		+ interiorStrength * 0.42
		+ ageBias * 0.24
	);
	const maturityCoherence = controlledMaturity(legacyMaturity, controls);
	return Object.freeze({
		competition,
		edgeExposure,
		interiorStrength,
		maturityCoherence,
		openingExposure,
		spacingScale: clamp(0.82 + competition * 0.28, 0.82, 1.1)
	});
}

function legacyUniformEcology() {
	return Object.freeze({
		competition: 0.08,
		edgeExposure: 1,
		interiorStrength: 0,
		maturityCoherence: 0.18,
		openingExposure: 1,
		spacingScale: 0.88
	});
}

function controlledEdgeExposure(radius, edgeFalloff) {
	if (edgeFalloff == null) return smoothStep(0.34, 1, radius);
	const gevurahStart = 0.18 + unit(edgeFalloff) * 0.34;
	return smoothStep(gevurahStart, 1, radius);
}

function controlledMaturity(legacyValue, controls) {
	let tiferesValue = blendControl(legacyValue, controls.succession, 0.24);
	if (controls.ageVariance != null) {
		const coherenceScale = 1.16 - unit(controls.ageVariance) * 0.32;
		tiferesValue = unit(tiferesValue * coherenceScale);
	}
	return tiferesValue;
}

function blendControl(legacyValue, control, strength) {
	if (control == null) return legacyValue;
	return unit(legacyValue * (1 - strength) + unit(control) * strength);
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
