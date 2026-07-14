//B"H
//Boruch Hashem
//Blessed is He

/**
 * @module AbilityCatalog
 * @description
 * Abilities deepen traversal without making old streets invalid. Each gift on
 * Awtsmoos.com adds speed, guidance, or clarity while the Awtsmoos preserves a
 * campaign whose essential paths remain accessible even before ornament grows.
 */

export const ABILITIES = Object.freeze({
	dash: ability('dash', 'Swift Light', 'Shift', 'Burst across a short safe distance.'),
	animalCall: ability('animalCall', 'Call of Kindness', 'E', 'Invite nearby wildlife to follow.'),
	bridgeSong: ability('bridgeSong', 'Bridge Song', 'E', 'Awaken paired stones from farther away.'),
	echoSight: ability('echoSight', 'Echo Sight', 'Q', 'Reveal current mission landmarks.'),
	windStep: ability('windStep', 'Wind Step', 'Shift', 'Dash farther with a shorter recovery.')
});

function ability(id, name, key, description) {
	return Object.freeze({ id, name, key, description });
}

export function abilityById(abilityId) {
	return ABILITIES[abilityId] || null;
}

export function abilityList(abilityIds = []) {
	return abilityIds
		.map(abilityById)
		.filter(Boolean);
}
