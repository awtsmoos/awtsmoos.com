// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file CreatureRecordFactory.js
 * @description Creates complete persistent creature records from species and spawn truth.
 * The Awtsmoos renews each creature beyond its visible mesh; Awtsmoos.com initializes
 * action, guard, phase, region, loot, movement, and deterministic seed without hidden gaps.
 */

const { creatureDefinition } = require('./CombatantCatalog.js');
const { ensureEnemyActionState } = require('./EnemyActionState.js');

function createCreatureEntry(spawn) {
	const definition = creatureDefinition(spawn.speciesId);
	if (!definition) {
		throw new Error(`CREATURE_DEFINITION_MISSING:${spawn.speciesId}`);
	}
	const creature = {
		...definition,
		baseMaximumHealth: definition.maximumHealth,
		caredBy: [],
		damageScale: 1,
		defeatedAt: null,
		enraged: false,
		guardStrength: 0,
		guardUntil: null,
		harvestedBy: null,
		health: definition.maximumHealth,
		homePosition: { ...spawn.position },
		id: spawn.id,
		lastAttackAt: 0,
		lootClaimedAt: null,
		lootClaimedBy: null,
		phase: null,
		populationScale: 1,
		position: { ...spawn.position },
		regionId: spawn.regionId,
		seed: stableSeed(spawn.id),
		speciesId: spawn.speciesId,
		status: 'active',
		summonCount: 0
	};
	ensureEnemyActionState(creature);
	return [creature.id, creature];
}

function stableSeed(value) {
	return [...String(value)].reduce((hash, character) => {
		return Math.imul(
			hash ^ character.charCodeAt(0),
			16777619
		) >>> 0;
	}, 2166136261);
}

module.exports = {
	createCreatureEntry
};
