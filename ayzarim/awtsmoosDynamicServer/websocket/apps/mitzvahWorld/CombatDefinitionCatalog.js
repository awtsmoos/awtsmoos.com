// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file CombatDefinitionCatalog.js
 * @description Indexes generated shared combat identities for authoritative server systems.
 * The Awtsmoos renews every action beneath one canonical source and measured gate;
 * Awtsmoos.com keeps legacy aliases readable without permitting identity to duplicate.
 */

const {
	COMBAT_AFFINITIES,
	COMBAT_EFFECTIVENESS,
	COMBAT_ELEMENTS,
	COMBAT_SCHEMA,
	COMBAT_STATUSES,
	COMBAT_STATUS_LIMIT,
	ENEMY_ACTION_DEFINITIONS,
	ENEMY_AFFINITY_PROFILES,
	PLAYER_CAST_DEFINITIONS,
	PLAYER_MELEE_DEFINITIONS
} = require('./CombatDefinitionRecords.js');

const PLAYER_COMBAT_DEFINITIONS = Object.freeze({
	...PLAYER_CAST_DEFINITIONS,
	...PLAYER_MELEE_DEFINITIONS
});
const CLIENT_ACTION_ALIASES = createClientAliasIndex();

function combatAffinityDefinition(affinityId) {
	return COMBAT_AFFINITIES[affinityId] || null;
}

function combatElementDefinition(elementId) {
	return COMBAT_ELEMENTS[elementId] || null;
}

function combatStatusDefinition(statusId) {
	return COMBAT_STATUSES[statusId] || null;
}

function playerCombatDefinition(actionId) {
	return PLAYER_COMBAT_DEFINITIONS[actionId]
		|| CLIENT_ACTION_ALIASES[actionId]
		|| null;
}

function enemyCombatDefinition(actionId) {
	return ENEMY_ACTION_DEFINITIONS[actionId] || null;
}

function enemyAffinityProfile(speciesId) {
	return ENEMY_AFFINITY_PROFILES[speciesId] || null;
}

function createClientAliasIndex() {
	const aliases = {};
	for (const definition of Object.values(PLAYER_COMBAT_DEFINITIONS)) {
		for (const alias of definition.clientAbilityIds || []) aliases[alias] = definition;
		for (const alias of definition.clientActionIds || []) aliases[alias] = definition;
	}
	return Object.freeze(aliases);
}

module.exports = {
	COMBAT_AFFINITIES,
	COMBAT_EFFECTIVENESS,
	COMBAT_ELEMENTS,
	COMBAT_SCHEMA,
	COMBAT_STATUSES,
	COMBAT_STATUS_LIMIT,
	ENEMY_ACTION_DEFINITIONS,
	ENEMY_AFFINITY_PROFILES,
	PLAYER_CAST_DEFINITIONS,
	PLAYER_COMBAT_DEFINITIONS,
	PLAYER_MELEE_DEFINITIONS,
	combatAffinityDefinition,
	combatElementDefinition,
	combatStatusDefinition,
	enemyAffinityProfile,
	enemyCombatDefinition,
	playerCombatDefinition
};
