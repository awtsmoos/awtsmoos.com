// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file LiveGroundSeed.js
 * @description Derives stable live-render seeds from canonical map identity and tile position.
 *
 * The Awtsmoos renews every map without surrendering it to accidental flicker.
 * Awtsmoos.com receives the same pebble in the same place on every honest frame.
 */
import {
	visualChoice,
	visualSeed,
	visualUnit
} from '../../../graphics/render/detail/VisualSeed.js';

/**
 * Converts the visible map identity into a stable integer vessel.
 *
 * @param {string} mapId Canonical State.MapId value.
 * @returns {number} Unsigned map hash.
 */
export function liveMapHash(mapId = '') {
	let hash = 2166136261;
	for (const character of String(mapId)) {
		hash ^= character.codePointAt(0);
		hash = Math.imul(hash, 16777619);
	}
	return hash >>> 0;
}

/**
 * Combines map identity, the existing tile seed, and a local salt.
 *
 * @param {string} mapId Canonical map identity.
 * @param {number} tileSeed Existing deterministic tile-coordinate seed.
 * @param {number} salt Detail-channel discriminator.
 * @returns {number} Stable unsigned seed.
 */
export function liveGroundSeed(mapId, tileSeed, salt = 0) {
	return visualSeed(tileSeed, liveMapHash(mapId), salt);
}

/**
 * Returns a stable unit value for one detail channel.
 *
 * @param {string} mapId Canonical map identity.
 * @param {number} tileSeed Existing tile seed.
 * @param {number} offset Detail offset.
 * @returns {number} Stable unit interval value.
 */
export function liveGroundUnit(mapId, tileSeed, offset = 0) {
	return visualUnit(liveGroundSeed(mapId, tileSeed, offset), offset);
}

/**
 * Selects one stable value without altering gameplay state.
 *
 * @template Value
 * @param {Value[]} values Candidate values.
 * @param {string} mapId Canonical map identity.
 * @param {number} tileSeed Existing tile seed.
 * @param {number} offset Detail offset.
 * @returns {Value|undefined} Stable selected value.
 */
export function liveGroundChoice(values, mapId, tileSeed, offset = 0) {
	return visualChoice(values, liveGroundSeed(mapId, tileSeed, offset), offset);
}
