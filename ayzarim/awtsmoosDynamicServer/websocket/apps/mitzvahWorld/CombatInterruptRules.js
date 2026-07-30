// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file CombatInterruptRules.js
 * @description Applies authoritative interrupt force to one active hostile cast instance.
 * The Awtsmoos renews concentration and its breaking without letting prediction decree the end;
 * Awtsmoos.com measures force against fresh resistance so stale casts cannot fire or send.
 */

const {
	ensureEnemyActionState,
	markEnemyActionInterrupted
} = require('./EnemyActionState.js');

function resolveEnemyInterrupt(creature, playerAction, now, sourceActorId) {
	const state = ensureEnemyActionState(creature);
	const force = Math.max(0, Number(playerAction.interruptForce || 0));
	const eligible = creature.status === 'active'
		&& ['telegraph', 'active'].includes(state.phase)
		&& !state.resolved
		&& Boolean(state.actionId)
		&& force > 0;
	if (!eligible) return noInterrupt(state, force);
	const before = Math.max(0, Number(state.interruptResistanceRemaining || 0));
	const remaining = Math.max(0, before - force);
	state.interruptResistanceRemaining = remaining;
	if (remaining > 0) {
		return Object.freeze({
			actionInstanceId: state.actionInstanceId,
			force,
			interrupted: false,
			remaining,
			resisted: true
		});
	}
	markEnemyActionInterrupted(creature, {
		now,
		reason: 'interrupt-resistance-depleted',
		sourceActionId: playerAction.canonicalActionId || playerAction.id,
		sourceActorId
	});
	return Object.freeze({
		actionInstanceId: state.actionInstanceId,
		force,
		interrupted: true,
		remaining: 0,
		resisted: false
	});
}

function noInterrupt(state, force) {
	return Object.freeze({
		actionInstanceId: state.actionInstanceId || null,
		force,
		interrupted: false,
		remaining: Number(state.interruptResistanceRemaining || 0),
		resisted: false
	});
}

module.exports = { resolveEnemyInterrupt };
