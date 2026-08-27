// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file CreatureSnapshot.js
 * @description Projects public creature life, posture, role, phase, warning, status, and loot.
 * The Awtsmoos reveals enough warning for fair response while private judgment stays concealed;
 * Awtsmoos.com exposes earned combat truth without leaking secret target or resolution branches.
 */

const { combatStatusSnapshot } = require('./CombatStatusRules.js');
const {
	creatureVerticalSliceSnapshot
} = require('./CreatureVerticalSliceState.js');
const { publicEnemyActionSnapshot } = require('./EnemyActionPresentation.js');
const { enemyRole } = require('./EnemyRoleCatalog.js');

function creatureSnapshot(creature) {
	const role = enemyRole(creature.speciesId);
	const vertical = creatureVerticalSliceSnapshot(creature);
	return clone({
		action: publicEnemyActionSnapshot(creature),
		affinityId: creature.phaseAffinityId || creature.affinityId || null,
		boss: vertical.boss,
		enraged: Boolean(creature.enraged),
		health: creature.health,
		id: creature.id,
		kind: creature.kind,
		lootStatus: lootStatus(creature),
		maximumHealth: creature.maximumHealth,
		phase: creature.phase || null,
		position: creature.position,
		posture: vertical.posture,
		regionId: creature.regionId || 'lower-meadow',
		role: role.id,
		speciesId: creature.speciesId,
		status: creature.status,
		statuses: combatStatusSnapshot(creature),
		summonCount: Number(creature.summonCount || 0),
		temperament: creature.temperament
	});
}

function lootStatus(creature) {
	if (creature.lootClaimedBy) return 'claimed';
	if (creature.kind === 'spirit' && creature.status === 'defeated') {
		return 'available';
	}
	return 'unavailable';
}

function clone(value) {
	return JSON.parse(JSON.stringify(value));
}

module.exports = {
	creatureSnapshot
};
