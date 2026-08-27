// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file CombatCastEffects.js
 * @description Applies authoritative healing, cleanse, blessing, restraint, and counter-cast effects.
 * The Awtsmoos renews compassion and restraint without allowing a client to author result;
 * Awtsmoos.com records each status and interruption while target kind keeps truth difficult.
 */
const {
	applyCombatStatus,
	combatStatusSnapshot,
	removeCombatStatus
} = require('./CombatStatusRules.js');
const { resolveEnemyInterrupt } = require('./CombatInterruptRules.js');

function applyCombatCastEffects(options) {
	const { action, caster, now, target } = options;
	const statusTarget = effectStatusTarget(action, caster, target);
	const removed = action.removeStatusIds
		.map(statusId => removeCombatStatus(statusTarget, statusId, now))
		.filter(Boolean);
	const applied = action.applyStatusIds
		.map(statusId => applyCombatStatus(statusTarget, statusId, {
			now,
			sourceActionId: action.canonicalActionId,
			sourceActorId: caster.id
		}))
		.filter(Boolean);
	const healing = target.kind === 'player'
		? healPlayer(target.value, action.healing)
		: 0;
	const interruption = action.targetKind === 'enemy-cast'
		? resolveEnemyInterrupt(target.value, action, now, caster.id)
		: null;
	return Object.freeze({
		applied,
		healing,
		interruption,
		removed,
		statuses: combatStatusSnapshot(statusTarget, now)
	});
}

function effectStatusTarget(action, caster, target) {
	if (action.targetKind === 'self') return caster.combat;
	if (target.kind === 'player') return target.value.combat;
	return target.value;
}

function healPlayer(player, amount) {
	const before = Number(player.combat.health || 0);
	const maximum = Number(player.combat.maximumHealth || before);
	player.combat.health = Math.min(
		maximum,
		before + Math.max(0, Number(amount || 0))
	);
	return player.combat.health - before;
}

module.exports = { applyCombatCastEffects };
