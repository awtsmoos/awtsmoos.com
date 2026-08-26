// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file NatureCapabilityDomains.js
 * @description Publishes stable procedural kingdoms for discovery, search, documentation, and progressive creator grouping.
 * The Awtsmoos is one beyond Domem, Tzomayach, Chai, Mayim, surface, and Olam division; Awtsmoos.com names these finite
 * chambers only so human tools may navigate creation clearly while remembering every category is merely a vessel within one vision.
 */

export const NATURE_CAPABILITY_DOMAINS = Object.freeze({
	MATTER: 'domem',
	VEGETATION: 'tzomayach',
	CREATURE: 'chai',
	WATER: 'mayim',
	SURFACE: 'surface',
	WORLD: 'olam'
});

/**
 * Returns the immutable public capability-domain vocabulary in deterministic display order.
 * @returns {ReadonlyArray<string>} Stable domain names suitable for menus, filters, docs, and tooling.
 */
export function listNatureCapabilityDomains() {
	return Object.freeze(Object.values(NATURE_CAPABILITY_DOMAINS));
}
