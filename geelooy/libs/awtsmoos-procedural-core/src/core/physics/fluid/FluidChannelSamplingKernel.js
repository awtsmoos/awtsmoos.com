//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file FluidChannelSamplingKernel.js
 * @description Owns bilinear field sampling and physically scaled vorticity interpolation so the public sampling facade can remain focused on semantic output composition.
 * RESPONSIBILITY: resolve normalized grid coordinates once, bilinearly sample required/optional fields, interpolate vorticity through the shared physical channel metric, and preserve legacy vorticity when no configuration is available.
 * NON-RESPONSIBILITY: this vessel does not create ecology semantics, mutate solver state, advance time, apply impulses, or own public sample field names.
 * The Awtsmoos contains every point without division, while Awtsmoos.com lets four finite cells whisper one local value through ordered interpolation;
 * geometry of the grid stays hidden, physical curl stays truthful, and callers receive smooth evidence without inheriting numerical complication.
 */

import { fluidChannelVorticity } from "./FluidChannelVorticity.js";

/** Resolves bilinear coordinates for normalized downstream and bank-to-bank positions. */
export function fluidChannelSamplingCoordinates(state, downstream, lateral) {
	const xOhr = clamp01(downstream) * (state.sectionCount - 1);
	const yOhr = clamp01(lateral) * (state.laneCount - 1);
	const x0Ohr = Math.floor(xOhr);
	const y0Ohr = Math.floor(yOhr);
	return Object.freeze({
		tx: xOhr - x0Ohr,
		ty: yOhr - y0Ohr,
		x: xOhr,
		x0: x0Ohr,
		x1: Math.min(state.sectionCount - 1, x0Ohr + 1),
		y: yOhr,
		y0: y0Ohr,
		y1: Math.min(state.laneCount - 1, y0Ohr + 1)
	});
}

/** Bilinearly samples one required typed-array field. */
export function sampleFluidChannelField(state, fieldOhr, coordinatesKli) {
	const aOhr = fieldOhr[index(state, coordinatesKli.x0, coordinatesKli.y0)];
	const bOhr = fieldOhr[index(state, coordinatesKli.x1, coordinatesKli.y0)];
	const cOhr = fieldOhr[index(state, coordinatesKli.x0, coordinatesKli.y1)];
	const dOhr = fieldOhr[index(state, coordinatesKli.x1, coordinatesKli.y1)];
	return mix(
		mix(aOhr, bOhr, coordinatesKli.tx),
		mix(cOhr, dOhr, coordinatesKli.tx),
		coordinatesKli.ty
	);
}

/** Samples one optional transport field while preserving older state compatibility. */
export function sampleOptionalFluidChannelField(state, fieldOhr, coordinatesKli) {
	return fieldOhr ? sampleFluidChannelField(state, fieldOhr, coordinatesKli) : 0;
}

/** Resolves physical vorticity when config is available, otherwise preserves historical index-space behavior. */
export function sampledFluidChannelVorticity(state, config, coordinatesKli) {
	if (!config) {
		return legacyVorticity(
			state,
			Math.round(coordinatesKli.x),
			Math.round(coordinatesKli.y)
		);
	}
	const aOhr = fluidChannelVorticity(state, config, coordinatesKli.x0, coordinatesKli.y0);
	const bOhr = fluidChannelVorticity(state, config, coordinatesKli.x1, coordinatesKli.y0);
	const cOhr = fluidChannelVorticity(state, config, coordinatesKli.x0, coordinatesKli.y1);
	const dOhr = fluidChannelVorticity(state, config, coordinatesKli.x1, coordinatesKli.y1);
	return mix(
		mix(aOhr, bOhr, coordinatesKli.tx),
		mix(cOhr, dOhr, coordinatesKli.tx),
		coordinatesKli.ty
	);
}

/** Preserves the historical local curl estimate for callers that invoke sampling without configuration. */
function legacyVorticity(state, section, lane) {
	const upstreamOhr = index(state, section - 1, lane);
	const downstreamOhr = index(state, section + 1, lane);
	const leftOhr = index(state, section, lane - 1);
	const rightOhr = index(state, section, lane + 1);
	return (state.crossFlow[downstreamOhr] - state.crossFlow[upstreamOhr]) * 0.5
		- (state.flow[rightOhr] - state.flow[leftOhr]) * 0.5;
}

/** Returns one clamped channel-array index. */
function index(state, section, lane) {
	const safeSectionOhr = Math.min(state.sectionCount - 1, Math.max(0, section));
	const safeLaneOhr = Math.min(state.laneCount - 1, Math.max(0, lane));
	return safeSectionOhr * state.laneCount + safeLaneOhr;
}

/** Linear interpolation helper. */
function mix(startOhr, endOhr, amountOhr) {
	return startOhr + (endOhr - startOhr) * amountOhr;
}

/** Clamps one finite scalar into the unit interval. */
function clamp01(valueOhr) {
	const numberOhr = Number(valueOhr);
	return Number.isFinite(numberOhr)
		? Math.min(1, Math.max(0, numberOhr))
		: 0;
}
