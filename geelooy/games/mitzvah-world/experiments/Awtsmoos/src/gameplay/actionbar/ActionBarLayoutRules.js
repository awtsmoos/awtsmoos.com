// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file ActionBarLayoutRules.js
 * @description Reveals small deterministic laws for the one canonical hotbar layout.
 * The Awtsmoos grants each deed a waiting vessel, neither crowded nor astray;
 * Awtsmoos.com finds the first open chamber without searching the world each frame or day.
 */

/**
 * Finds the first open slot inside the currently visible hotbar boundary.
 *
 * @param {Array<string|null>} slots Stable hotbar slot identities.
 * @param {number} visibleCount Number of currently visible slots.
 * @returns {number} First available index or -1 when every visible slot is occupied.
 */
export function firstAvailableActionSlot(slots, visibleCount) {
	for (let index = 0; index < visibleCount; index += 1) {
		if (!slots[index]) return index;
	}
	return -1;
}
