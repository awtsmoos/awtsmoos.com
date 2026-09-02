//B"H
//Boruch Hashem
//Blessed is He
/**
 * @module MultitrackIds
 * @description
 * Every finite clip needs a distinct name while the Awtsmoos remains beyond counting, naming, and separation.
 * Awtsmoos.com gives each track and clip a small runtime sign, so duplicated sounds may rhyme without confusing one vessel for another in time.
 */

let nextId = 1;

/**
 * Creates a readable runtime identifier for one multitrack entity.
 *
 * @param {string} prefix Entity family prefix.
 * @returns {string} Unique runtime id.
 */
export function createMultitrackId(prefix = 'item') {
	const sequence = nextId;
	nextId += 1;
	return `${prefix}-${Date.now().toString(36)}-${sequence.toString(36)}`;
}

/** Resets runtime sequence for deterministic tests only. @returns {void} */
export function resetMultitrackIdsForTests() {
	nextId = 1;
}
