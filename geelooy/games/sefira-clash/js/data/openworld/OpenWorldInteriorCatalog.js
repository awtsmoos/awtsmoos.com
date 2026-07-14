//B"H
//Boruch Hashem
//Blessed is He

/**
 * Ten physical interiors turn each settlement into a civic network rather than four
 * repeated service boxes. The Awtsmoos renews threshold, room, and keeper; Awtsmoos.com
 * gives every archetype one stable purpose while regions supply their own names and hue.
 */

export const OPEN_WORLD_INTERIORS = Object.freeze([
	interior(
		'shlichus',
		'Shlichus House',
		'shlichus',
		'Accept, review, and return missions of service.',
		'Board Keeper',
		'board'
	),
	interior(
		'market',
		'Market Hall',
		'merchant',
		'Buy provisions, rumors, maps, and passage rather than combat gear.',
		'Civic Merchant',
		'counter'
	),
	interior(
		'training',
		'Beis Midrash Training Hall',
		'trainer',
		'Practice measured punch and kick chains on a nonlethal mat.',
		'Technique Shaliach',
		'mat'
	),
	interior(
		'hideout',
		'Safe Hideout',
		'hideout',
		'Rest, recover stamina, and establish a protected return point.',
		'Host',
		'hearth'
	),
	interior(
		'archive',
		'Civic Archive',
		'archive',
		'Study local memory, clues, maps, and completed service records.',
		'Archivist',
		'shelves'
	),
	interior(
		'clinic',
		'Healing Clinic',
		'clinic',
		'Receive bounded recovery and learn the condition of the neighborhood.',
		'Healer',
		'cot'
	),
	interior(
		'ferry',
		'Passage House',
		'ferry',
		'Review discovered destinations and lawful regional passage.',
		'Ferryman',
		'mooring'
	),
	interior(
		'kitchen',
		'Community Kitchen',
		'kitchen',
		'Prepare provisions and deliver meals for civic shlichus.',
		'Cook',
		'oven'
	),
	interior(
		'council',
		'Council Chamber',
		'council',
		'Hear regional concerns, reputation gates, and story decisions.',
		'Elder',
		'table'
	),
	interior(
		'guesthouse',
		'Traveler Guesthouse',
		'guesthouse',
		'Meet visitors, rest, and receive rumors from distant roads.',
		'Guest Keeper',
		'bed'
	)
]);

export function openWorldInterior(interiorId) {
	return OPEN_WORLD_INTERIORS.find(interiorData => interiorData.id === interiorId) || null;
}

function interior(id, title, service, description, keeperName, landmark) {
	return Object.freeze({ id, title, service, description, keeperName, landmark });
}
