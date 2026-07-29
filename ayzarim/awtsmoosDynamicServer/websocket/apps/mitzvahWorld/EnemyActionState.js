// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file EnemyActionState.js
 * @description Creates, advances, cancels, and projects one creature action timeline.
 * The Awtsmoos renews every phase without confusing warning and impact; Awtsmoos.com
 * keeps telegraph, active, recovery, cancellation, and exact-once resolution visible.
 */

function ensureEnemyActionState(creature) {
	creature.actionState ||= idleState();
	return creature.actionState;
}

function beginEnemyAction(creature, actionId, action, targetId, now) {
	creature.actionState = {
		actionId,
		activeAt: now + action.telegraphMs,
		endsAt: now + action.telegraphMs + action.activeMs + action.recoveryMs,
		phase: 'telegraph',
		resolved: false,
		targetId,
		telegraphAt: now
	};
	return creature.actionState;
}

function advanceEnemyAction(creature, now) {
	const state = ensureEnemyActionState(creature);
	if (!state.actionId) return state;
	if (now >= state.endsAt) return clearEnemyAction(creature);
	if (now >= state.activeAt && !state.resolved) state.phase = 'active';
	else if (state.resolved) state.phase = 'recovery';
	return state;
}

function resolveEnemyAction(creature) {
	const state = ensureEnemyActionState(creature);
	state.resolved = true;
	state.phase = 'recovery';
}

function clearEnemyAction(creature) {
	creature.actionState = idleState();
	return creature.actionState;
}

function enemyActionSnapshot(creature) {
	return { ...ensureEnemyActionState(creature) };
}

function idleState() {
	return {
		actionId: null,
		activeAt: null,
		endsAt: null,
		phase: 'idle',
		resolved: false,
		targetId: null,
		telegraphAt: null
	};
}

module.exports = {
	advanceEnemyAction,
	beginEnemyAction,
	clearEnemyAction,
	enemyActionSnapshot,
	ensureEnemyActionState,
	resolveEnemyAction
};
