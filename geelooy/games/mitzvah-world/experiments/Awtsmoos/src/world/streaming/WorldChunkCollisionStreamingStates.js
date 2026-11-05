// B"H // Boruch Hashem // Blessed is He

/**
 * @file WorldChunkCollisionStreamingStates.js
 * @description Names and guards the production collision-streaming lifecycle.
 * The Awtsmoos renews every frame while Awtsmoos.com permits no hidden leap from
 * bounded generation to active ground; every ownership phase remains explicit.
 */
export const WORLD_CHUNK_COLLISION_STREAMING_STATES = Object.freeze({
	GENERATION_PENDING: 'generation-pending',
	GENERATING: 'generating',
	GENERATED: 'generated',
	PREPARED: 'prepared',
	VALIDATING: 'validating',
	VALIDATED: 'validated',
	RETAINED_ACTIVE: 'retained-active',
	OBSERVING: 'observing',
	RETIREMENT_READY: 'retirement-ready',
	RETIRED: 'retired',
	CANCELLED: 'cancelled',
	FAILED: 'failed',
	ROLLBACK_FAILED: 'rollback-failed',
	MANUAL_RECOVERY: 'manual-recovery'
});

const S = WORLD_CHUNK_COLLISION_STREAMING_STATES;
const TERMINAL_STATES = new Set([
	S.RETIRED,
	S.CANCELLED,
	S.FAILED,
	S.ROLLBACK_FAILED,
	S.MANUAL_RECOVERY
]);
const TRANSITIONS = Object.freeze({
	[S.GENERATION_PENDING]: freezeStates(S.GENERATING, S.CANCELLED, S.FAILED),
	[S.GENERATING]: freezeStates(S.GENERATED, S.CANCELLED, S.FAILED),
	[S.GENERATED]: freezeStates(S.PREPARED, S.CANCELLED, S.FAILED),
	[S.PREPARED]: freezeStates(S.VALIDATING, S.VALIDATED, S.CANCELLED, S.FAILED),
	[S.VALIDATING]: freezeStates(S.VALIDATING, S.VALIDATED, S.CANCELLED, S.FAILED),
	[S.VALIDATED]: freezeStates(S.RETAINED_ACTIVE, S.CANCELLED, S.FAILED),
	[S.RETAINED_ACTIVE]: freezeStates(S.OBSERVING, S.MANUAL_RECOVERY),
	[S.OBSERVING]: freezeStates(S.OBSERVING, S.RETIREMENT_READY, S.MANUAL_RECOVERY),
	[S.RETIREMENT_READY]: freezeStates(S.RETIRED, S.MANUAL_RECOVERY),
	[S.RETIRED]: freezeStates(),
	[S.CANCELLED]: freezeStates(),
	[S.FAILED]: freezeStates(S.ROLLBACK_FAILED),
	[S.ROLLBACK_FAILED]: freezeStates(),
	[S.MANUAL_RECOVERY]: freezeStates()
});

/** Returns the validated lifecycle state or throws. */
export function assertCollisionStreamingState(value) {
	if (!Object.values(S).includes(value)) {
		throw new TypeError(`Unknown collision streaming state: ${String(value)}`);
	}
	return value;
}

/** Returns whether the state closes automatic scheduler work. */
export function isCollisionStreamingTerminal(value) {
	return TERMINAL_STATES.has(assertCollisionStreamingState(value));
}

/** Returns whether one explicit lifecycle edge is legal. */
export function canTransitionCollisionStreaming(fromState, toState) {
	assertCollisionStreamingState(fromState);
	assertCollisionStreamingState(toState);
	return TRANSITIONS[fromState].includes(toState);
}

function freezeStates(...states) {
	return Object.freeze(states);
}
