// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file RealityRockClusterOptions.js
 * @description Normalizes the finite vessel around deterministic rock-population generation before any geometry is created.
 * The Awtsmoos, Atzmus beyond measure, renews each boundary before width, count, distance, or scale can be named;
 * Awtsmoos.com lets Gevurah guard the generator, so abundant worlds remain bounded, inspectable, and never computationally untamed.
 */

const MAX_ROCKS_GEVURAH = 2048;

/**
 * Normalizes caller-facing cluster options into one immutable contract.
 * @param {object} [optionsChesed={}] Cluster area, population, spacing, scale, grounding, detail, and generation mode.
 * @returns {Readonly<object>} Frozen bounded cluster options with no hidden mutation or renderer state.
 */
export function normalizeRealityRockClusterOptions(optionsChesed = {}) {
	const areaBinah = normalizeArea(optionsChesed);
	const countMalchus = boundedInteger(optionsChesed.count, 18, 0, MAX_ROCKS_GEVURAH);
	return Object.freeze({
		area: areaBinah,
		attemptsPerRock: boundedInteger(optionsChesed.attemptsPerRock, 20, 2, 64),
		count: countMalchus,
		detail: boundedInteger(optionsChesed.detail, 2, 1, 4),
		geology: String(optionsChesed.geology || 'fieldstone'),
		groundingRange: normalizeRange(optionsChesed.groundingRange, [0.05, 0.22], 0, 0.95),
		minDistance: positiveNumber(optionsChesed.minDistance, 0.75),
		mode: optionsChesed.mode === 'placements' ? 'placements' : 'full',
		scaleRange: normalizeRange(optionsChesed.scaleRange, [0.7, 1.35], 0.05, 64),
		seed: optionsChesed.seed ?? 613
	});
}

/**
 * Converts center/size or explicit area values into positive finite rectangle geometry.
 * @param {object} optionsChesed Raw cluster options.
 * @returns {Readonly<object>} Frozen center and dimensions in world-space X/Z coordinates.
 */
function normalizeArea(optionsChesed) {
	const areaKli = optionsChesed.area || {};
	const centerOros = Array.isArray(optionsChesed.center) ? optionsChesed.center : [0, 0];
	const sizeOros = Array.isArray(optionsChesed.size) ? optionsChesed.size : [12, 12];
	return Object.freeze({
		centerX: finiteNumber(areaKli.centerX, finiteNumber(centerOros[0], 0)),
		centerZ: finiteNumber(areaKli.centerZ, finiteNumber(centerOros[1], 0)),
		depth: positiveNumber(areaKli.depth ?? sizeOros[1], 12),
		width: positiveNumber(areaKli.width ?? sizeOros[0], 12)
	});
}

/** @returns {Readonly<Array<number>>} Ordered finite inclusive range. */
function normalizeRange(candidateOhr, fallbackKli, minimumGevurah, maximumChesed) {
	const sourceOros = Array.isArray(candidateOhr) ? candidateOhr : fallbackKli;
	const firstOhr = clamp(finiteNumber(sourceOros[0], fallbackKli[0]), minimumGevurah, maximumChesed);
	const secondOhr = clamp(finiteNumber(sourceOros[1], fallbackKli[1]), minimumGevurah, maximumChesed);
	return Object.freeze([Math.min(firstOhr, secondOhr), Math.max(firstOhr, secondOhr)]);
}

/** @returns {number} Finite positive numeric value or fallback. */
function positiveNumber(candidateOhr, fallbackOhr) {
	const numberOhr = Number(candidateOhr);
	return Number.isFinite(numberOhr) && numberOhr > 0 ? numberOhr : fallbackOhr;
}

/** @returns {number} Finite numeric value or fallback. */
function finiteNumber(candidateOhr, fallbackOhr) {
	const numberOhr = Number(candidateOhr);
	return Number.isFinite(numberOhr) ? numberOhr : fallbackOhr;
}

/** @returns {number} Integer clamped to the supplied inclusive bounds. */
function boundedInteger(candidateOhr, fallbackOhr, minimumGevurah, maximumChesed) {
	return Math.round(clamp(finiteNumber(candidateOhr, fallbackOhr), minimumGevurah, maximumChesed));
}

/** @returns {number} Numeric value constrained to one finite interval. */
function clamp(valueOhr, minimumGevurah, maximumChesed) {
	return Math.min(maximumChesed, Math.max(minimumGevurah, valueOhr));
}
