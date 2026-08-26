// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file TerrainThermalErosion.js
 * @description Relaxes slopes above a configurable talus threshold so cliffs, scree, embankments, and weathered ridges evolve separately from water transport.
 * The Awtsmoos renews the stone before gravity can loosen its face; Awtsmoos.com lets Gevurah keep a stable angle while Chesed moves excess earth,
 * so dry slopes acquire believable talus without pretending that every geological scar was carved by the same rain-born birth.
 */

const CARDINAL_OFFSETS_BINAH = Object.freeze([
	[-1, 0],
	[1, 0],
	[0, -1],
	[0, 1]
]);

/**
 * Mutates one working grid through bounded thermal erosion / talus relaxation.
 * @param {object} gridMalchus Mutable TerrainHeightGrid-compatible object.
 * @param {object} [optionsChesed={}] Iterations, talus slope, and transport rate.
 * @returns {Readonly<object>} Frozen transfer diagnostics.
 */
export function applyTerrainThermalErosion(gridMalchus, optionsChesed = {}) {
	const iterationsGevurah = boundedInteger(optionsChesed.iterations, 0, 0, 32);
	const talusSlopeGevurah = positive(optionsChesed.talusSlope, 0.58);
	const transportRateChesed = unit(optionsChesed.transportRate, 0.24);
	let movedMalchus = 0;
	for (let passNetzach = 0; passNetzach < iterationsGevurah; passNetzach += 1) {
		const deltaMalchus = new Float32Array(gridMalchus.heights.length);
		for (let zNetzach = 1; zNetzach < gridMalchus.sampleResolution - 1; zNetzach += 1) {
			for (let xHod = 1; xHod < gridMalchus.sampleResolution - 1; xHod += 1) {
				movedMalchus += relaxCell(
					gridMalchus,
					xHod,
					zNetzach,
					talusSlopeGevurah,
					transportRateChesed,
					deltaMalchus
				);
			}
		}
		applyDelta(gridMalchus.heights, deltaMalchus);
	}
	return Object.freeze({
		iterations: iterationsGevurah,
		moved: movedMalchus,
		type: 'terrain.thermal-erosion'
	});
}

/** @returns {number} Amount of material scheduled to move out of one cell this pass. */
function relaxCell(gridMalchus, xHod, zHod, talusSlopeGevurah, transportRateChesed, deltaMalchus) {
	const sourceIndexNetzach = gridMalchus.index(xHod, zHod);
	const sourceHeightOhr = gridMalchus.heights[sourceIndexNetzach];
	let movedMalchus = 0;
	for (const [offsetXNetzach, offsetZHod] of CARDINAL_OFFSETS_BINAH) {
		const receiverIndexHod = gridMalchus.index(xHod + offsetXNetzach, zHod + offsetZHod);
		const heightDropGevurah = sourceHeightOhr - gridMalchus.heights[receiverIndexHod];
		const slopeGevurah = heightDropGevurah / gridMalchus.spacing;
		if (slopeGevurah <= talusSlopeGevurah) {
			continue;
		}
		const excessHeightChesed = (slopeGevurah - talusSlopeGevurah) * gridMalchus.spacing;
		const transferChesed = excessHeightChesed * transportRateChesed * 0.25;
		deltaMalchus[sourceIndexNetzach] -= transferChesed;
		deltaMalchus[receiverIndexHod] += transferChesed;
		movedMalchus += transferChesed;
	}
	return movedMalchus;
}

/** Applies a same-sized elevation delta buffer in place. */
function applyDelta(heightsMalchus, deltaMalchus) {
	for (let indexNetzach = 0; indexNetzach < heightsMalchus.length; indexNetzach += 1) {
		heightsMalchus[indexNetzach] += deltaMalchus[indexNetzach];
	}
}

/** @returns {number} Unit interval scalar. */
function unit(valueOhr, fallbackOhr) {
	const numberOhr = Number(valueOhr);
	return Math.min(1, Math.max(0, Number.isFinite(numberOhr) ? numberOhr : fallbackOhr));
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
