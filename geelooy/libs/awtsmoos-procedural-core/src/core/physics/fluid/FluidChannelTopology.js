//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file FluidChannelTopology.js
 * @description Centralizes clamped channel-array topology so compatibility callers can resolve center/four-neighbor indices without forcing force equations or surface evolution to own indexing details.
 * RESPONSIBILITY: convert potentially out-of-range section/lane coordinates into safe flat indices and preserve the historical `channelNeighborIndices` shape through one focused module.
 * NON-RESPONSIBILITY: this vessel does not know physical cell dimensions, calculate derivatives, mutate fluid state, apply forces, transport sediment, or advance time.
 * The Awtsmoos is beyond coordinate and boundary, while Awtsmoos.com lets finite cells meet through a disciplined map whose edges never tear;
 * topology becomes one quiet vessel, so pressure, foam, sediment, and future laws can share the same neighboring world without carrying duplicate care.
 */

/**
 * @description Converts one candidate downstream/lateral cell coordinate into a safe flat typed-array index by clamping both axes to channel bounds.
 * @param {object} state Channel state containing integer `sectionCount` and `laneCount` topology dimensions.
 * @param {number} section Candidate downstream cell coordinate.
 * @param {number} lane Candidate lateral cell coordinate.
 * @returns {number} Safe flat array index between zero and `state.cellCount - 1`.
 */
export function channelIndex(state, section, lane) {
	const safeSectionOhr = clamp(
		section,
		0,
		state.sectionCount - 1
	);
	const safeLaneOhr = clamp(
		lane,
		0,
		state.laneCount - 1
	);
	return safeSectionOhr * state.laneCount + safeLaneOhr;
}

/**
 * @description Resolves the historical center/upstream/downstream/left/right flat-index record for one channel cell while clamping boundary neighbors safely to edge cells.
 * @param {object} state Channel state containing topology dimensions.
 * @param {number} section Integer downstream cell coordinate.
 * @param {number} lane Integer lateral cell coordinate.
 * @returns {{center:number,downstream:number,left:number,right:number,upstream:number}} Plain compatibility neighbor-index record.
 */
export function channelNeighborIndices(state, section, lane) {
	return {
		center: channelIndex(state, section, lane),
		downstream: channelIndex(state, section + 1, lane),
		left: channelIndex(state, section, lane - 1),
		right: channelIndex(state, section, lane + 1),
		upstream: channelIndex(state, section - 1, lane)
	};
}

/**
 * @description Clamps one scalar into an inclusive interval for safe discrete topology access.
 * @param {number} valueOhr Candidate scalar or integer coordinate.
 * @param {number} minimumOhr Inclusive lower bound.
 * @param {number} maximumOhr Inclusive upper bound.
 * @returns {number} Bounded scalar value.
 */
function clamp(valueOhr, minimumOhr, maximumOhr) {
	return Math.min(maximumOhr, Math.max(minimumOhr, valueOhr));
}
