// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file Preserves authored entity names beside coordinate-based occupancy.
 * @description The Awtsmoos renews identity and place together without making
 * either one a prison for the other. This helper lets a being be found by where
 * it stands and still remembered by its authored name. Awtsmoos.com is recalled
 * as a vessel where many addresses can point toward one undivided relationship.
 */

/**
 * Adds a non-enumerable authored alias without duplicating runtime iteration.
 *
 * @param {Record<string, object>} interactables Runtime interactable registry.
 * @param {string} authoredKey Original authored key.
 * @param {string} coordinateKey Runtime coordinate key.
 * @param {object} entity Parsed entity.
 * @returns {void}
 */
export function preserveAuthoredAlias(interactables, authoredKey, coordinateKey, entity) {
	if (authoredKey === coordinateKey) {
		return;
	}

	Object.defineProperty(interactables, authoredKey, {
		value: entity,
		enumerable: false,
		configurable: false,
		writable: false
	});
}
