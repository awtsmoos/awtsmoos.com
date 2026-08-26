//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file FluidChannelTransportState.js
 * @description Owns typed-array vessels for suspended sediment and geomorphic evidence without burdening the core channel state allocator with transport-specific lifecycle details.
 * RESPONSIBILITY: allocate equilibrium/current/next sediment fields, erosion/deposition evidence fields, seed normalized sediment values, and restore them during simulation reset.
 * NON-RESPONSIBILITY: this vessel does not advect sediment, change bed elevation, sample water, apply impulses, or choose physical coefficients.
 * The Awtsmoos renews both current and grain while neither vessel owns the source, and Awtsmoos.com lets sediment remember its authored beginning without pretending erosion has already remade the land;
 * typed arrays keep this earthy testimony contiguous and cheap, so river ecology and geology may later read one disciplined hand.
 */

/**
 * Creates transport-specific arrays for one channel state.
 * @param {number} cellCount Positive channel cell count.
 * @returns {object} Mutable typed-array transport vessels.
 */
export function createFluidChannelTransportState(cellCount) {
	return {
		deposition: new Float32Array(cellCount),
		erosion: new Float32Array(cellCount),
		nextDeposition: new Float32Array(cellCount),
		nextErosion: new Float32Array(cellCount),
		nextSediment: new Float32Array(cellCount),
		restSediment: new Float32Array(cellCount),
		sediment: new Float32Array(cellCount)
	};
}

/**
 * Seeds one cell's equilibrium suspended-sediment concentration.
 * @param {object} state Channel state containing transport arrays.
 * @param {number} index Cell index.
 * @param {number} sedimentOhr Normalized authored concentration.
 * @returns {void}
 */
export function seedFluidChannelTransportCell(state, index, sedimentOhr) {
	const normalizedOhr = clamp01(sedimentOhr);
	state.restSediment[index] = normalizedOhr;
	state.sediment[index] = normalizedOhr;
	state.nextSediment[index] = normalizedOhr;
}

/**
 * Restores transport fields to authored equilibrium and clears transient geomorphic evidence.
 * @param {object} state Mutable channel state.
 * @returns {object} Same channel state for fluent reset composition.
 */
export function resetFluidChannelTransportState(state) {
	state.sediment.set(state.restSediment);
	state.nextSediment.set(state.restSediment);
	state.erosion.fill(0);
	state.deposition.fill(0);
	state.nextErosion.fill(0);
	state.nextDeposition.fill(0);
	return state;
}

/** Clamps one finite scalar into the unit interval. */
function clamp01(valueOhr) {
	const numberOhr = Number(valueOhr);
	return Number.isFinite(numberOhr)
		? Math.min(1, Math.max(0, numberOhr))
		: 0;
}
