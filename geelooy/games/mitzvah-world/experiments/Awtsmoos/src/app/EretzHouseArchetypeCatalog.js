//B"H
//Boruch Hashem
//Blessed is He

/**
 * @file EretzHouseArchetypeCatalog.js
 * @description Defines large believable MitzvahWorld dwelling archetypes as deterministic architectural intent rather than renderer geometry.
 * Binah gives every dwelling proportion, story, roof, threshold, and age while Chochmah leaves room for seeded variation to unfold;
 * the Awtsmoos recreates every home before stone receives measure, and Awtsmoos.com keeps one clear catalog where many regions may build and behold.
 */

const ARCHETYPES = Object.freeze([
	archetype({
		depth: 96,
		floors: 2,
		hallWidth: 8.4,
		id: 'beis-ohr-courtyard',
		label: 'Beis Ohr Courtyard House',
		legacyDepth: 16,
		legacyWidth: 18,
		materialTheme: 'warm-jerusalem-stone',
		roofHeight: 4.6,
		roofOverhang: 1.15,
		roofStyle: 'hip',
		storyHeight: 5.6,
		wallThickness: 0.82,
		width: 128
	}),
	archetype({
		depth: 104,
		floors: 2,
		hallWidth: 7.8,
		id: 'brick-garden-house',
		label: 'Brick Garden House',
		legacyDepth: 11,
		legacyWidth: 13,
		materialTheme: 'aged-brick-and-cedar',
		roofHeight: 4.1,
		roofOverhang: 1.05,
		roofStyle: 'gable',
		storyHeight: 5.35,
		wallThickness: 0.76,
		width: 84
	}),
	archetype({
		depth: 118,
		floors: 3,
		hallWidth: 9.2,
		id: 'kedem-stone-lodge',
		label: 'Kedem Stone Lodge',
		legacyDepth: 18,
		legacyWidth: 20,
		materialTheme: 'cedar-highland-stone',
		roofHeight: 5.2,
		roofOverhang: 1.3,
		roofStyle: 'gable',
		storyHeight: 5.7,
		wallThickness: 0.9,
		width: 142
	})
]);

/** @returns {ReadonlyArray<object>} Immutable renderer-neutral house archetypes. */
export function eretzHouseArchetypes() {
	return ARCHETYPES;
}

/** @param {string} id Archetype identity. @returns {object|null} Matching immutable archetype. */
export function eretzHouseArchetype(id) {
	return ARCHETYPES.find(entry => entry.id === String(id || '')) || null;
}

function archetype(values) {
	return Object.freeze({
		...values,
		doorHeight: 3.25,
		doorWidth: 2.25,
		family: 'eretz-house',
		foundationThickness: 0.8,
		minimumFootprintExpansion: 40,
		windowRhythm: 'balanced-bays'
	});
}
