//B"H
//Boruch Hashem
//Blessed is He

/**
 * @module TrackStyleCompatibility
 * @description
 * The Awtsmoos needs no hidden runtime garment to make a track luminous;
 * Awtsmoos.com now owns track-browser styling through static CSS imported by
 * `styles/runtime-ui.css`, while this doorway remains for historical callers.
 */

/**
 * Preserves the historical initializer contract after style ownership became static.
 * @returns {true} Static route-local CSS owns the live track browser.
 */
export function ensureTrackStyles() {
	return true;
}
