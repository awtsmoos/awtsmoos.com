// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file VillageBotanicalSpeciesProfiles.js
 * @description Curates the flowers that form the reference image's strongest
 * color masses. Every catalog species still appears; these return as repeated
 * notes in the garden-song through which the Awtsmoos clothes the mountain.
 */

const REFERENCE_MASS_SPECIES = Object.freeze([
	'daisy', 'shasta-daisy', 'iris', 'rose-pink', 'rose-red', 'rose-white',
	'lavender', 'foxglove', 'delphinium', 'lupine', 'hydrangea', 'phlox-pink',
	'geranium-red', 'geranium-pink', 'petunia-pink', 'pansy', 'coreopsis',
	'coneflower', 'allium', 'peony', 'hosta', 'wild-strawberry', 'salvia',
	'astilbe-pink', 'sweet-alyssum', 'forget-me-not', 'ornamental-grass'
]);

/** Selects stable repeated species without coupling placement to catalog order. */
export function referenceRepeatSpecies(availableSpecies, count) {
	const available = new Set(availableSpecies);
	const candidates = REFERENCE_MASS_SPECIES.filter((id) => available.has(id));
	return Array.from({ length: count }, (_, index) => candidates[index % candidates.length]);
}

/** Gives each botanical family a believable world-scale rhythm. */
export function referenceSpeciesScale(species, ordinal, repeated = false) {
	const familyScale = species.family === 'shrub'
		? 0.92
		: species.family === 'ground'
			? 1.08
			: 1;
	const heightGuard = species.height > 1.2 ? 0.78 : 1;
	const repeatScale = repeated ? 0.78 : 1;
	return familyScale * heightGuard * repeatScale * (0.86 + ordinal % 5 * 0.055);
}

/** Names the compositional job of a species for diagnostics and movie staging. */
export function referenceSpeciesRole(species) {
	if (species.family === 'shrub') return 'flowering-structure';
	if (species.archetype === 'grass' || species.archetype === 'spike') return 'vertical-rhythm';
	if (species.family === 'ground') return 'ground-tapestry';
	return 'color-mass';
}
