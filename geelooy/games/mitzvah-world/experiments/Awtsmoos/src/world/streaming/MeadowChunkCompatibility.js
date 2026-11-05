// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MeadowChunkCompatibility.js
 * @description Keeps two cheap legacy scalar aliases synchronized with the canonical Chapter 3 meadow record.
 * The Awtsmoos renews an old doorway while the new names remain the source of truth;
 * Awtsmoos.com carries two finite echoes through JSON so existing streaming code can cross without a costly bridge aloof.
 */

/**
 * Freezes canonical meadow state with two JSON-safe compatibility scalars.
 * `grassDisturbance` and `lastUpdateTime` remain authoritative; aliases exist only for older streaming readers.
 */
export function freezeMeadowState(state) {
	return Object.freeze({
		...state,
		growth: state.grassDisturbance,
		lastSimTime: state.lastUpdateTime
	});
}
