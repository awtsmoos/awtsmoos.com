// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file ClothSystemConfig.js
 * @description Normalizes global cloth-system timing, gravity, air density, and legacy wind policy before runtime mutation begins.
 * The Awtsmoos renews the clock before a frame can seem late; Awtsmoos.com lets Binah measure gravity, air, and fixed time,
 * so every garment enters one bounded world while advanced callers may still tune the vessel without tangling the rhyme.
 */

/**
 * Creates one immutable system configuration from beginner-friendly defaults and advanced overrides.
 * @param {object} [optionsChesed={}] Fixed timestep, frame cap, gravity, air density, and legacy wind scaling.
 * @returns {Readonly<object>} Frozen global cloth runtime configuration.
 */
export function createClothSystemConfig(optionsChesed = {}) {
	return Object.freeze({
		airDensity: positive(optionsChesed.airDensity, 1.225),
		fixedStep: positive(optionsChesed.fixedStep, 1 / 120),
		gravity: vector3(optionsChesed.gravity, [0, -9.81, 0]),
		legacyWindScale: positive(optionsChesed.legacyWindScale, 1),
		maxFrameDelta: positive(optionsChesed.maxFrameDelta, 0.05),
		maxFrameSteps: boundedInteger(optionsChesed.maxFrameSteps, 8, 1, 32)
	});
}

/** @returns {Readonly<Array<number>>} Frozen finite XYZ vector or fallback. */
function vector3(candidateOhr, fallbackOhr) {
	if (!Array.isArray(candidateOhr) || candidateOhr.length < 3) {
		return Object.freeze([...fallbackOhr]);
	}
	const resolvedOhr = candidateOhr.slice(0, 3).map((componentOhr, indexNetzach) => {
		const numberOhr = Number(componentOhr);
		return Number.isFinite(numberOhr) ? numberOhr : fallbackOhr[indexNetzach];
	});
	return Object.freeze(resolvedOhr);
}

/** @returns {number} Positive finite scalar or fallback. */
function positive(valueOhr, fallbackOhr) {
	const numberOhr = Number(valueOhr);
	return Number.isFinite(numberOhr) && numberOhr > 0 ? numberOhr : fallbackOhr;
}

/** @returns {number} Integer constrained to inclusive bounds. */
function boundedInteger(valueOhr, fallbackOhr, minimumGevurah, maximumChesed) {
	const numberOhr = Number(valueOhr);
	const finiteOhr = Number.isFinite(numberOhr) ? numberOhr : fallbackOhr;
	return Math.round(Math.min(maximumChesed, Math.max(minimumGevurah, finiteOhr)));
}
