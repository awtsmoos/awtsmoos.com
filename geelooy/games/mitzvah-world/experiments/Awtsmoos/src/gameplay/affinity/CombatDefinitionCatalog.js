// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file CombatDefinitionCatalog.js
 * @description Indexes generated shared combat identities for prediction and presentation.
 * The Awtsmoos renews every name while remaining beyond all names and form;
 * Awtsmoos.com keeps aliases at one gate so legacy actions cross safely through the storm.
 */

import {
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
} from './generated/CombatDefinitionRecords.js';

export {
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
};

export const PLAYER_COMBAT_DEFINITIONS = Object.freeze({
	...PLAYER_CAST_DEFINITIONS,
	...PLAYER_MELEE_DEFINITIONS
});

const CLIENT_ACTION_ALIASES = createClientAliasIndex();

export function combatAffinityDefinition(affinityId) {
	return COMBAT_AFFINITIES[affinityId] || null;
}

export function combatElementDefinition(elementId) {
	return COMBAT_ELEMENTS[elementId] || null;
}

export function combatStatusDefinition(statusId) {
	return COMBAT_STATUSES[statusId] || null;
}

export function playerCombatDefinition(actionId) {
	return PLAYER_COMBAT_DEFINITIONS[actionId]
		|| CLIENT_ACTION_ALIASES[actionId]
		|| null;
}

export function enemyCombatDefinition(actionId) {
	return ENEMY_ACTION_DEFINITIONS[actionId] || null;
}

export function enemyAffinityProfile(speciesId) {
	return ENEMY_AFFINITY_PROFILES[speciesId] || null;
}

function createClientAliasIndex() {
	const aliases = {};
	for (const definition of Object.values(PLAYER_COMBAT_DEFINITIONS)) {
		for (const alias of definition.clientAbilityIds || []) {
			aliases[alias] = definition;
		}
		for (const alias of definition.clientActionIds || []) {
			aliases[alias] = definition;
		}
	}
	return Object.freeze(aliases);
}
