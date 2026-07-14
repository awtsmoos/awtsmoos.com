// B"H
// Boruch Hashem
// Blessed is He
/** @module WorkerLifecycle @description Names every truthful worker state and transition. */

export const WORKER_STATES = Object.freeze([
	'queued',
	'active',
	'heartbeating',
	'stale',
	'reaping',
	'archived',
	'completed',
	'failed',
	'cancelled',
	'quarantined'
]);

const TRANSITIONS = Object.freeze({
	queued: ['active', 'cancelled'],
	active: ['heartbeating', 'stale', 'completed', 'failed', 'cancelled'],
	heartbeating: ['stale', 'completed', 'failed', 'cancelled'],
	stale: ['reaping', 'quarantined'],
	reaping: ['archived', 'quarantined'],
	archived: [],
	completed: ['archived'],
	failed: ['archived', 'quarantined'],
	cancelled: ['archived'],
	quarantined: ['archived']
});

/** Transitions a worker state only through a declared edge. */
export function transitionWorker(worker, nextState, at = new Date().toISOString()) {
	if (!WORKER_STATES.includes(nextState) || !TRANSITIONS[worker?.state]?.includes(nextState)) {
		throw new TypeError(`Invalid worker transition: ${worker?.state} -> ${nextState}`);
	}
	return Object.freeze({ ...worker, state: nextState, updatedAt: at });
}
