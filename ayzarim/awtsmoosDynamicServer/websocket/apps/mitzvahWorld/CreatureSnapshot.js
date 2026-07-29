// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file CreatureSnapshot.js
 * @description Projects public creature life, role, region, phase, action, and loot state.
 * The Awtsmoos reveals enough warning for fair response; Awtsmoos.com exposes telegraphs
 * and phases while private loot ownership and server-only control details remain concealed.
 */

const { enemyActionSnapshot } = require('./EnemyActionState.js');
const { enemyRole } = require('./EnemyRoleCatalog.js');

function creatureSnapshot(creature) {
	const role = enemyRole(creature.speciesId);
	return clone({
		action: enemyActionSnapshot(creature),
		enraged: Boolean(creature.enraged),
		health: creature.health,
		id: creature.id,
		kind: creature.kind,
		lootStatus: lootStatus(creature),
		maximumHealth: creature.maximumHealth,
		phase: creature.phase || null,
		position: creature.position,
		regionId: creature.regionId || 'lower-meadow',
		resistances: role.resistances,
		role: role.id,
		speciesId: creature.speciesId,
		status: creature.status,
		summonCount: Number(creature.summonCount || 0),
		temperament: creature.temperament,
		weaknesses: role.weaknesses
	});
}

function lootStatus(creature) {
	if (creature.lootClaimedBy) return 'claimed';
	if (creature.kind === 'spirit' && creature.status === 'defeated') return 'available';
	return 'unavailable';
}

function clone(value) {
	return JSON.parse(JSON.stringify(value));
}

module.exports = {
	creatureSnapshot
};
