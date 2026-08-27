// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file EnemyActionState.js
 * @description Creates, advances, interrupts, resolves, and projects one typed creature action.
 * The Awtsmoos renews each cast instance without letting a cancelled past produce a future blow;
 * Awtsmoos.com resets resistance per action and makes warning, interruption, and recovery show.
 */

function ensureEnemyActionState(creature) {
	creature.actionState ||= idleState();
	return creature.actionState;
}

function beginEnemyAction(creature, actionId, action, targetId, now) {
	creature.actionSequence = Number(creature.actionSequence || 0) + 1;
	creature.actionState = {
		actionId,
		actionInstanceId: `${creature.id}:${creature.actionSequence}`,
		activeAt: now + action.telegraphMs,
		affinityId: action.affinityId || null,
		counterGuidance: action.counterGuidance || null,
		danger: action.danger || 'unknown',
		elementId: action.elementId || null,
		endsAt: now + action.telegraphMs + action.activeMs + action.recoveryMs,
		englishName: action.englishName || action.id,
		hebrewName: action.hebrewName || '',
		interruptResistance: Number(action.interruptResistance || 0),
		interruptResistanceRemaining: Number(action.interruptResistance || 0),
		interruptedAt: null,
		interruptionReason: null,
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
	if (state.phase === 'interrupted') return state;
	if (now >= state.activeAt && !state.resolved) state.phase = 'active';
	else if (state.resolved) state.phase = 'recovery';
	return state;
}

function resolveEnemyAction(creature) {
	const state = ensureEnemyActionState(creature);
	if (state.phase === 'interrupted') return state;
	state.resolved = true;
	state.phase = 'recovery';
	return state;
}

function markEnemyActionInterrupted(creature, options) {
	const state = ensureEnemyActionState(creature);
	state.endsAt = Number(options.now) + 300;
	state.interruptedAt = Number(options.now);
	state.interruptionReason = options.reason || 'interrupt-force';
	state.interruptedByActionId = options.sourceActionId || null;
	state.interruptedByActorId = options.sourceActorId || null;
	state.interruptResistanceRemaining = 0;
	state.phase = 'interrupted';
	state.resolved = true;
	return state;
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
		actionInstanceId: null,
		activeAt: null,
		affinityId: null,
		counterGuidance: null,
		danger: null,
		elementId: null,
		endsAt: null,
		englishName: null,
		hebrewName: null,
		interruptResistance: 0,
		interruptResistanceRemaining: 0,
		interruptedAt: null,
		interruptionReason: null,
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
	markEnemyActionInterrupted,
	resolveEnemyAction
};
