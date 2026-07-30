// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file EnemyActionSupportRules.js
 * @description Resolves non-damage hostile guard, movement, healing, summon, and enrage actions.
 */

const { applyCombatStatus } = require('./CombatStatusRules.js');

function resolveEnemySupportAction(options) {
	const { action, creature, creatures, target, now } = options;
	if (action.type === 'guard') return guard(creature, action, now);
	if (action.type === 'dodge' || action.type === 'retreat') {
		return reposition(creature, target, action.type);
	}
	if (action.type === 'heal') return heal(creature, action, now);
	if (action.type === 'summon') return summon(creature, creatures, action);
	if (action.type === 'enrage') return enrage(creature, action);
	return null;
}

function guard(creature, action, now) {
	creature.guardStrength = action.guardStrength;
	creature.guardUntil = now + action.activeMs + action.recoveryMs;
	return { type: 'guard' };
}

function reposition(creature, target, type) {
	const direction = type === 'retreat' ? -1 : 1;
	const dx = target.position.z - creature.position.z;
	const dz = creature.position.x - target.position.x;
	const length = Math.hypot(dx, dz) || 1;
	creature.position.x += dx / length * 2.4 * direction;
	creature.position.z += dz / length * 2.4 * direction;
	return { type };
}

function heal(creature, action, now) {
	creature.health = Math.min(creature.maximumHealth, creature.health + action.healing);
	for (const statusId of action.applyStatusIds || []) {
		applyCombatStatus(creature, statusId, {
			now,
			sourceActionId: action.canonicalActionId || action.id,
			sourceActorId: creature.id
		});
	}
	return { healing: action.healing, type: 'heal' };
}

function summon(creature, creatures, action) {
	return {
		creatureIds: creatures.summonShades(creature, action.summonCount),
		type: 'summon'
	};
}

function enrage(creature, action) {
	creature.damageScale = action.damageScale;
	creature.enraged = true;
	creature.phase = 'burning-letters';
	creature.phaseAffinityId = action.affinityId;
	return { phase: creature.phase, type: 'enrage' };
}

module.exports = { resolveEnemySupportAction };
