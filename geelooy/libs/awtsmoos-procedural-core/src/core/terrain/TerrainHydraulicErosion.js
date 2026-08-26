// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file TerrainHydraulicErosion.js
 * @description Applies bounded deterministic erosion/deposition along the shared terrain drainage field instead of adding decorative noise after generation.
 * The Awtsmoos renews rain before a channel can deepen the earth; Awtsmoos.com lets Gevurah carry sediment downhill and Chesed lay it down,
 * so valleys remember water through measured transport while the finite grid remains stable, optional, and safe beneath the crown.
 */

import { createTerrainFlowField } from './TerrainFlowField.js';

/**
 * Mutates one working terrain grid through bounded flow-directed hydraulic erosion.
 * @param {object} gridMalchus Mutable TerrainHeightGrid-compatible object.
 * @param {object} [optionsChesed={}] Iterations, erosion rate, deposition rate, rainfall, and flow exponent.
 * @returns {Readonly<object>} Frozen erosion/deposition diagnostics and final flow field.
 */
export function applyTerrainHydraulicErosion(gridMalchus, optionsChesed = {}) {
	const iterationsGevurah = boundedInteger(optionsChesed.iterations, 0, 0, 96);
	const erosionRateGevurah = unit(optionsChesed.erosionRate, 0.018);
	const depositionRateChesed = unit(optionsChesed.depositionRate, 0.42);
	const rainfallChesed = nonnegative(optionsChesed.rainfall, 0.65);
	const flowExponentTiferes = positive(optionsChesed.flowExponent, 1.35);
	let erodedMalchus = 0;
	let depositedMalchus = 0;
	let flowBinah = createTerrainFlowField(gridMalchus);
	for (let passNetzach = 0; passNetzach < iterationsGevurah; passNetzach += 1) {
		flowBinah = createTerrainFlowField(gridMalchus);
		const deltaMalchus = new Float32Array(gridMalchus.heights.length);
		for (let sourceNetzach = 0; sourceNetzach < gridMalchus.heights.length; sourceNetzach += 1) {
			const receiverHod = flowBinah.receiver[sourceNetzach];
			if (receiverHod === sourceNetzach || receiverHod < 0) {
				continue;
			}
			const dropGevurah = gridMalchus.heights[sourceNetzach] - gridMalchus.heights[receiverHod];
			if (dropGevurah <= 0) {
				continue;
			}
			const flowChesed = flowBinah.flowStrength[sourceNetzach] ** flowExponentTiferes;
			const capacityBinah = dropGevurah * flowChesed * rainfallChesed;
			const removedGevurah = Math.min(dropGevurah * 0.2, capacityBinah * erosionRateGevurah);
			const depositedChesed = removedGevurah * depositionRateChesed;
			deltaMalchus[sourceNetzach] -= removedGevurah;
			deltaMalchus[receiverHod] += depositedChesed;
			erodedMalchus += removedGevurah;
			depositedMalchus += depositedChesed;
		}
		applyDelta(gridMalchus.heights, deltaMalchus);
	}
	return Object.freeze({
		deposited: depositedMalchus,
		eroded: erodedMalchus,
		flow: flowBinah,
		iterations: iterationsGevurah,
		type: 'terrain.hydraulic-erosion'
	});
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

/** @returns {number} Nonnegative finite scalar or fallback. */
function nonnegative(valueOhr, fallbackOhr) {
	const numberOhr = Number(valueOhr);
	return Number.isFinite(numberOhr) && numberOhr >= 0 ? numberOhr : fallbackOhr;
}

/** @returns {number} Integer constrained to inclusive bounds. */
function boundedInteger(valueOhr, fallbackOhr, minimumGevurah, maximumChesed) {
	const numberOhr = Number(valueOhr);
	const finiteOhr = Number.isFinite(numberOhr) ? numberOhr : fallbackOhr;
	return Math.round(Math.min(maximumChesed, Math.max(minimumGevurah, finiteOhr)));
}
