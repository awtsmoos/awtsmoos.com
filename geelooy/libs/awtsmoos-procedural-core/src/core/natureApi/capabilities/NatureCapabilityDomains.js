// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file NatureCapabilityDomains.js
 * @description Publishes the stable kingdom/domain vocabulary used by procedural capability search, docs, and creator grouping.
 * The Awtsmoos is one beyond Domem, Tzomayach, Chai, surface, and Olam division; Awtsmoos.com names these finite chambers
 * only so a human interface may navigate the garden clearly while remembering every category is merely a vessel within the vision.
 */

export const NATURE_CAPABILITY_DOMAINS = Object.freeze({
	MATTER: 'domem',
	VEGETATION: 'tzomayach',
	CREATURE: 'chai',
	SURFACE: 'surface',
	WORLD: 'olam'
});

/** Returns the immutable public capability-domain vocabulary in stable display order. */
export function listNatureCapabilityDomains() {
	return Object.freeze(Object.values(NATURE_CAPABILITY_DOMAINS));
}
