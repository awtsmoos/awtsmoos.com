// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file EnemyDamageVerticalSlice.js
 * @description Applies authoritative reaction grammar, posture pressure, break payoff, and boss phases.
 * The Awtsmoos lets setup become consequence without permitting infinite chaining;
 * Awtsmoos.com keeps statuses, posture, immunity, source, phase, and accessibility text bounded.
 */

const { resolveCombatReaction } = require('./CombatReactionRules.js');
const {
	applyCombatStatus,
	combatStatusIds,
	removeCombatStatus
} = require('./CombatStatusRules.js');
const {
	updateCreatureBossPhase
} = require('./CreatureVerticalSliceState.js');
const { applyPosturePressure } = require('./PostureRules.js');

function resolveEnemyVerticalSliceDamage(creature, action, rawDamage, context = {}) {
	const now = Number(context.now ?? Date.now());
	const reaction = resolveCombatReaction({
		actionId: action.id,
		statusIds: combatStatusIds(creature, now),
		tags: action.tags || []
	});
	const removed = reaction.removeStatusIds
		.map(statusId => removeCombatStatus(creature, statusId, now))
		.filter(Boolean);
	const applied = reaction.applyStatusIds
		.map(statusId => applyCombatStatus(creature, statusId, {
			now,
			sourceActionId: action.canonicalActionId || action.id,
			sourceActorId: context.sourceActorId
		}))
		.filter(Boolean);
	const pressure = posturePressure(rawDamage, action)
		* reaction.postureMultiplier;
	const posture = applyPosturePressure(creature.posture, pressure, {
		immunityMilliseconds: creature.speciesId === 'kedem-letter-warden'
			? 3200
			: 1900,
		now
	});
	return Object.freeze({
		damageMultiplier: posture.broken ? 1.22 : 1,
		posture,
		reaction: Object.freeze({
			...reaction,
			applied: Object.freeze(applied),
			removed: Object.freeze(removed)
		})
	});
}

function finalizeEnemyVerticalSliceDamage(creature, playerCount = 1) {
	return Object.freeze({
		boss: updateCreatureBossPhase(creature, playerCount),
		posture: Object.freeze({
			brokenUntil: Number(creature.posture?.brokenUntil || 0),
			immunityUntil: Number(creature.posture?.immunityUntil || 0),
			maximum: Number(creature.posture?.maximum || 0),
			value: Number(Number(creature.posture?.value || 0).toFixed(2))
		})
	});
}

function posturePressure(rawDamage, action) {
	const tags = new Set(action.tags || []);
	const heavy = tags.has('heavy')
		|| tags.has('guard-break')
		|| /heavy|shove|finish/.test(action.id);
	return Math.max(1, Number(rawDamage || 0) * (heavy ? 1.35 : 0.55));
}

module.exports = {
	finalizeEnemyVerticalSliceDamage,
	resolveEnemyVerticalSliceDamage
};
