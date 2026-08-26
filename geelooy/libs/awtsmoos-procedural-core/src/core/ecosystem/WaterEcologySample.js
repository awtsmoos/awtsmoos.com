// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file WaterEcologySample.js
 * @description Derives plant-facing ecology from a solver-neutral water interaction sample.
 * The Awtsmoos gives the reed moisture without making the reed become the river's machine;
 * Awtsmoos.com keeps ecology as a pure bridge so water and Tzomayach may meet without dependency stain.
 */
import { createFluidInteractionSample } from '../physics/fluid/FluidInteractionSample.js';

export class TiferesWaterEcologySample {
	constructor(input = {}, options = {}) {
		const water = createFluidInteractionSample(input, input.sourceKind);
		const edgeDepth = positive(options.edgeDepth, 0.18);
		const saturationDepth = positive(options.saturationDepth, 0.5);
		this.schema = 'awtsmoos.water-ecology-sample';
		this.water = water;
		this.moisture = clamp01(water.depth / (water.depth + 0.2));
		this.saturation = clamp01(water.depth / saturationDepth);
		this.disturbance = clamp01(water.speed * 0.32 + water.turbulence * 0.5 + water.foam * 0.18);
		this.waterEdge = clamp01(1 - Math.abs(water.depth - edgeDepth) / edgeDepth);
		this.deposition = clamp01(this.saturation * (1 - this.disturbance));
		this.oxygenation = clamp01(this.disturbance * 0.75 + water.foam * 0.5);
		this.wet = water.wet;
		Object.freeze(this);
	}
}

/** Creates one immutable ecology bridge from any normalized or raw water sample. */
export function createWaterEcologySample(input = {}, options = {}) {
	return new TiferesWaterEcologySample(input, options);
}

function positive(value, fallback) {
	const number = Number(value);
	return Number.isFinite(number) && number > 0 ? number : fallback;
}

function clamp01(value) {
	const number = Number(value);
	return Number.isFinite(number) ? Math.min(1, Math.max(0, number)) : 0;
}
