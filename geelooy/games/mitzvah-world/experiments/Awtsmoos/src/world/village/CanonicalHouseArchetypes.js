// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file CanonicalHouseArchetypes.js
 * @description Defines varied, slope-aware architectural families for H10-H27.
 */

const FORMER_BASE_VOLUME = 7.6 * 5.9 * 5.5;
const PLAYER_REFERENCE_VOLUME = 0.61;

const ARCHETYPES = Object.freeze({
	'family-house': preset(14.6, 11.4, 2, 3.25, 4.2, ['entry', 'kitchen-dining', 'living-room', 'bedroom', 'study']),
	'guest-house': preset(17.2, 12.8, 2, 3.35, 4.8, ['entry', 'communal-room', 'kitchen-dining', 'guest-bedroom', 'guest-bedroom', 'Torah-library']),
	'hillside-split-level': preset(12.8, 10.2, 2, 3.15, 3.8, ['entry', 'living-room', 'kitchen-dining', 'bedroom', 'storage-room']),
	'merchant-shop': preset(13.8, 10.8, 2, 3.3, 4.1, ['shop', 'storage-room', 'kitchen-dining', 'living-room', 'bedroom']),
	'small-stone-cottage': preset(11.4, 9.2, 1, 3.45, 3.3, ['entry', 'living-room', 'kitchen-dining', 'bedroom']),
	'workshop-barn': preset(15.6, 12.2, 1, 3.9, 3.7, ['workshop', 'storage-room', 'kitchen-dining', 'study'])
});

export function canonicalHouseArchitecture(archetype, variant = 0) {
	const source = ARCHETYPES[archetype];
	if (!source) throw new Error(`Unknown canonical house archetype: ${archetype}`);
	const safeVariant = Math.abs(Math.trunc(Number(variant) || 0));
	const width = source.width + safeVariant % 3 * 0.55;
	const depth = source.depth + safeVariant % 2 * 0.45;
	const storyHeight = source.storyHeight + safeVariant % 2 * 0.08;
	const wallHeight = source.stories * storyHeight;
	const volume = width * depth * wallHeight;
	return Object.freeze({
		archetype,
		balcony: source.stories > 1 && safeVariant % 3 !== 1,
		chimney: archetype !== 'workshop-barn' || safeVariant % 2 === 0,
		depth,
		expansionRatio: volume / FORMER_BASE_VOLUME,
		foundationStyle: safeVariant % 2 ? 'stepped-stone' : 'retaining-plinth',
		gardenType: ['herbs', 'flowers', 'orchard-edge'][safeVariant % 3],
		minimumExpansion: 1,
		porch: archetype !== 'hillside-split-level' || safeVariant % 2 === 0,
		roofMaterial: safeVariant % 3 === 2 ? 'clay-tile' : 'slate',
		roofRise: source.roofRise + safeVariant % 3 * 0.22,
		roomTypes: Object.freeze([...source.roomTypes]),
		stories: source.stories,
		storyHeight,
		volume,
		volumeRatio: volume / PLAYER_REFERENCE_VOLUME,
		wallHeight,
		width,
		windowPattern: ['paired', 'irregular', 'deep-set'][safeVariant % 3]
	});
}

export function canonicalHouseArchetypes() {
	return Object.keys(ARCHETYPES);
}

function preset(width, depth, stories, storyHeight, roofRise, roomTypes) {
	return Object.freeze({ depth, roofRise, roomTypes: Object.freeze(roomTypes), stories, storyHeight, width });
}
