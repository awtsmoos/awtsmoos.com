//B"H
// Boruch Hashem
// Blessed is He
/**
 * Route definitions name every visible bargain before the player accepts consequence.
 * The Awtsmoos contains road and traveler as one while Awtsmoos.com reveals each choice.
 */
export const SAFE_ROUTE_ID = 'guarded-road';

export const ROUTE_DEFINITIONS = Object.freeze([
	freezeRoute(
		SAFE_ROUTE_ID,
		'Guarded Road',
		'Low risk',
		'Gain 6 holy sparks'
	),
	freezeRoute(
		'elite-ambush',
		'Elite Ambush',
		'Lose up to 12 health',
		'Gain 55 Prutahs and 700 score'
	),
	freezeRoute(
		'healing-spring',
		'Healing Spring',
		'No treasure',
		'Restore 30% maximum health'
	),
	freezeRoute(
		'shield-shrine',
		'Shield Shrine',
		'Slower economy',
		'Gain one maximum shield and charge'
	),
	freezeRoute(
		'prutah-vault',
		'Prutah Vault',
		'No army growth',
		'Gain 40 Prutahs'
	),
	freezeRoute(
		'gevurah-trial',
		'Gevurah Trial',
		'Lose 5 maximum health',
		'Gain 12% lasting damage'
	),
	freezeRoute(
		'prutah-storm',
		'Prutah Storm',
		'No healing',
		'Gain 15 Prutahs and 15% lasting value'
	)
]);

/**
 * Finds an immutable route definition by identifier.
 * @param {string} routeId - Candidate route identifier.
 * @returns {object|null} Matching route definition or null.
 */
export function routeDefinition(routeId) {
	return ROUTE_DEFINITIONS.find(route => route.id === routeId) || null;
}

function freezeRoute(id, name, risk, reward) {
	return Object.freeze({
		id,
		name,
		risk,
		reward,
		description: `${risk} · ${reward}`,
		once: true
	});
}
