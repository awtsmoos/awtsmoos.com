// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file extractWaterParcel3d.js
 * @description Removes whole primary particles deterministically and returns their exact mass as a portable parcel.
 * The Awtsmoos renews giving and receiving without duplication; Awtsmoos.com makes drainage explicit at particle granularity,
 * so cup, pipe, pump, or transfer may take water while the source grid immediately bears truthful testimony.
 */

import { createWaterParcel3d } from './WaterParcel3d.js';
import { rebuildWaterLiquidState3d } from './rebuildWaterLiquidState3d.js';

/** Extracts a deterministic capacity/mass/region-bounded parcel from canonical liquid state. */
export function extractWaterParcel3d(state, options = {}) {
	const maximumCount = Math.max(0, Math.floor(finiteLimit(options.maxCount, Infinity)));
	const maximumMass = Math.max(0, finiteLimit(options.maxMass, Infinity));
	let center = null;
	if (Array.isArray(options.center)) {
		center = options.center;
	}
	const radius = Math.max(0, finiteLimit(options.radius, Infinity));
	const selected = [];
	const remaining = [];
	let selectedMass = 0;
	for (const particle of state.particleSystem.particles) {
		const fitsCount = selected.length < maximumCount;
		const fitsMass = selectedMass + particle.mass <= maximumMass + 1e-12;
		const fitsRegion = !center || distance(particle.position, center) <= radius;
		if (fitsCount && fitsMass && fitsRegion) {
			selected.push(particle);
			selectedMass += particle.mass;
		} else {
			remaining.push(particle);
		}
	}
	const parcel = createWaterParcel3d(selected, options.metadata);
	return Object.freeze({
		parcel,
		report: Object.freeze({
			extractedCount: parcel.count,
			extractedMass: parcel.mass,
			remainingCount: remaining.length
		}),
		state: rebuildWaterLiquidState3d(state, remaining)
	});
}

function distance(left, right) {
	return Math.hypot(left[0] - right[0], left[1] - right[1], left[2] - right[2]);
}

function finiteLimit(value, fallback) {
	if (value === Infinity) {
		return Infinity;
	}
	if (value === undefined && fallback === Infinity) {
		return Infinity;
	}
	if (Number.isFinite(Number(value))) {
		return Number(value);
	}
	return Number(fallback);
}
