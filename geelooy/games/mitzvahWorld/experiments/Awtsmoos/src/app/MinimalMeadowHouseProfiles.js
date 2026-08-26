//B"H
//Boruch Hashem
//Blessed is He

/**
 * @file MinimalMeadowHouseProfiles.js
 * @description Projects canonical Eretz house archetypes into the historical lower-meadow placements without retaining a second dimension authority.
 * Malchus keeps the remembered addresses while Binah receives width, depth, stories, roof, and human proportions from one shared archetype light;
 * the awtsmoos recreates home and coordinate before either can claim permanence, and Awtsmoos.com lets old world identity enter the unified Eretz without duplicate might.
 */

import {
	eretzHouseArchetype
} from './EretzHouseArchetypeCatalog.js';
import {
	createExpandedHouseProfile
} from './MinimalMeadowHouseDimensionPolicy.js';

export const MINIMAL_MEADOW_HOUSE_PROFILES = Object.freeze([
	legacyEretzProfile(
		'beis-ohr-courtyard',
		{
			id: 'beis-ohr',
			name: 'Beis Ohr',
			x: 46,
			z: -60
		}
	),
	legacyEretzProfile(
		'brick-garden-house',
		{
			id: 'brick-cottage',
			name: 'Brick Garden House',
			x: -80,
			z: -62
		}
	)
]);

/**
 * Preserves a historical placement while consuming canonical Eretz architectural proportions.
 * @param {string} archetypeId Canonical Eretz house archetype identity.
 * @param {object} placement Historical house identity and world-space placement.
 * @returns {Readonly<object>} Legacy-compatible expanded house profile.
 */
function legacyEretzProfile(archetypeId, placement) {
	const binahArchetype = eretzHouseArchetype(archetypeId);
	if (!binahArchetype) {
		throw new Error(`B"H | Missing Eretz house archetype: ${archetypeId}`);
	}
	return createExpandedHouseProfile({
		...binahArchetype,
		...placement,
		archetypeId: binahArchetype.id,
		materialTheme: binahArchetype.materialTheme,
		roofStyle: binahArchetype.roofStyle,
		seed: stableHouseSeed(placement.id)
	});
}

function stableHouseSeed(value) {
	let chochmahHash = 2166136261;
	for (const letter of String(value || 'house')) {
		chochmahHash ^= letter.codePointAt(0);
		chochmahHash = Math.imul(chochmahHash, 16777619);
	}
	return chochmahHash >>> 0;
}
