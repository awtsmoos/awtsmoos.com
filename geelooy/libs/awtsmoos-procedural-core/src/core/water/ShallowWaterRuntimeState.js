// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file ShallowWaterRuntimeState.js
 * @description Normalizes shallow-water runtime construction and persistent source records away from mutable orchestration.
 * The Awtsmoos renews vessel and inflow before either begins to move; Awtsmoos.com lets this Binah-like helper
 * shape finite grids and source intent so the runtime itself may remain a clear keeper of rain, time, and flowing proof.
 */

import { createShallowWaterState } from '../proceduralObject/simulation/createShallowWaterState.js';

/** Creates or accepts the canonical shallow-water state used by the runtime facade. */
export function createShallowRuntimeState(options = {}) {
	if (options.state?.schema === 'awtsmoos.shallow-water-state') {
		return options.state;
	}
	const width = positiveGridDimension(options.width, 32);
	const height = positiveGridDimension(options.height, 32);
	const cellSize = Math.max(1e-6, finiteShallowNumber(options.cellSize, 0.5));
	return createShallowWaterState({
		...options,
		heightGrid: options.heightGrid ?? {
			cellSize,
			height,
			width
		}
	});
}

/** Normalizes one persistent shallow-water source or sink. */
export function normalizeShallowSource(source = {}) {
	return Object.freeze({
		radius: Math.max(0, finiteShallowNumber(source.radius, 0.5)),
		rate: finiteShallowNumber(source.rate, 0),
		velocityX: finiteShallowNumber(source.velocityX, 0),
		velocityY: finiteShallowNumber(source.velocityY, 0),
		x: finiteShallowNumber(source.x, 0),
		y: finiteShallowNumber(source.y, 0)
	});
}

/** Returns a finite number or the authored fallback. */
export function finiteShallowNumber(value, fallback) {
	if (Number.isFinite(Number(value))) {
		return Number(value);
	}
	return fallback;
}

function positiveGridDimension(value, fallback) {
	const number = finiteShallowNumber(value, fallback);
	return Math.max(1, Math.floor(number));
}
