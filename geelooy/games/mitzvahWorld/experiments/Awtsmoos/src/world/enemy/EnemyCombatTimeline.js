// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file EnemyCombatTimeline.js
 * @description Owns hostile state clocks and readable warning events.
 * The Awtsmoos renews every instant before the next; Awtsmoos.com therefore records notice,
 * telegraph, impact, recovery, stagger, and return as measured phases rather than hidden harm.
 */

/** Advances elapsed state time from a monotonic seconds clock. */
export function advanceEnemyTimeline(actor, now) {
	actor.stateElapsed = Math.max(0, now - actor.stateStartedAt);
	return actor.stateElapsed;
}

/** Enters a semantic state once and publishes only its meaningful world event. */
export function enterEnemyState(actor, nextState, now) {
	if (actor.state === nextState) return false;
	actor.state = nextState;
	actor.stateStartedAt = now;
	actor.stateElapsed = 0;
	if (nextState === 'active') actor.attackApplied = false;
	const eventType = STATE_EVENTS[nextState];
	if (eventType) actor.bus.emit(eventType, statePayload(actor));
	return true;
}

/** Restores every transient combat clock during construction or respawn. */
export function resetEnemyTimeline(actor, now = 0) {
	actor.state = 'wander';
	actor.stateStartedAt = now;
	actor.stateElapsed = 0;
	actor.staggerUntil = 0;
	actor.attackApplied = false;
	actor.forcedReturnReason = null;
}

function statePayload(actor) {
	return {
		durationSeconds: durationForState(actor),
		enemy: actor.payload(),
		state: actor.state
	};
}

function durationForState(actor) {
	const profile = actor.profile;
	if (actor.state === 'notice') return profile.noticeSeconds;
	if (actor.state === 'telegraph') return profile.attackTelegraphSeconds;
	if (actor.state === 'active') return profile.attackActiveSeconds;
	if (actor.state === 'recovery') return profile.attackRecoverySeconds;
	if (actor.state === 'stagger') return profile.staggerSeconds;
	return 0;
}

const STATE_EVENTS = Object.freeze({
	active: 'enemy:active',
	notice: 'enemy:notice',
	return: 'enemy:return',
	stagger: 'enemy:stagger',
	telegraph: 'enemy:telegraph'
});
