//B"H
//Boruch Hashem
//Blessed is He

/**
 * @file ObstacleCourseLifecycleTransitions.js
 * @description
 * Owns pre-run status changes, countdown maturity, and retry creation for obstacle activities.
 * The Awtsmoos gives beginning, becoming, and return their measured place; Awtsmoos.com
 * keeps lifecycle law apart from checkpoint motion, so each vessel may reveal its proper grace.
 */

import { createObstacleCourseRunState } from './ObstacleCourseRunState.js';
import {
	acceptRunCommand,
	createNextRunState,
	rejectRunCommand,
	requireRunTime
} from './ObstacleCourseRunReceipt.js';

/**
 * @description Performs one constrained pre-run lifecycle status transition.
 * @param {Readonly<object>} state Current run state.
 * @param {string[]} allowed Allowed source statuses.
 * @param {string} status Destination status.
 * @param {number} atMs Authoritative monotonic time.
 * @param {object} [changes={}] Additional state changes.
 * @returns {Readonly<object>} Accepted or rejected transition receipt.
 */
export function changeObstacleCourseStatus(state, allowed, status, atMs, changes = {}) {
	const transitionTime = requireRunTime(atMs);
	if (!allowed.includes(state.status)) {
		return rejectRunCommand(state, 'invalid-lifecycle-transition');
	}
	const normalizedChanges = normalizeLifecycleTimes({
		...changes,
		status
	}, transitionTime);
	const nextState = createNextRunState(state, normalizedChanges);
	return acceptRunCommand(nextState, state, status);
}

/**
 * @description Starts timed activity only after its configured countdown has matured.
 * @param {Readonly<object>} state Current run state.
 * @param {Readonly<object>} definition Activity definition.
 * @param {number} atMs Authoritative monotonic time.
 * @returns {Readonly<object>} Accepted or rejected transition receipt.
 */
export function startObstacleCourseRun(state, definition, atMs) {
	const startTime = requireRunTime(atMs);
	if (!Number.isFinite(state.countdownStartedAtMs)) {
		return rejectRunCommand(state, 'countdown-not-started');
	}
	const readyAtMs = state.countdownStartedAtMs + definition.countdownMs;
	if (state.status !== 'countdown' || startTime < readyAtMs) {
		return rejectRunCommand(state, 'countdown-not-complete');
	}
	const nextState = createNextRunState(state, {
		startedAtMs: startTime,
		status: 'active'
	});
	return acceptRunCommand(nextState, state, 'start');
}

/**
 * @description Creates a fresh attempt while preserving the caller-owned run namespace.
 * @param {Readonly<object>} state Previous run state.
 * @param {Readonly<object>} definition Activity definition.
 * @param {number} atMs Authoritative retry creation time.
 * @returns {Readonly<object>} Accepted retry receipt.
 */
export function retryObstacleCourseRun(state, definition, atMs) {
	const nextAttempt = state.attempt + 1;
	const nextState = createObstacleCourseRunState(definition, {
		attempt: nextAttempt,
		createdAtMs: requireRunTime(atMs),
		runSeriesId: state.runSeriesId
	});
	return acceptRunCommand(nextState, state, 'retry');
}

/**
 * @description Replaces lifecycle time placeholders with one validated numeric transition time.
 * @param {object} changes Requested state changes.
 * @param {number} transitionTime Validated authoritative time.
 * @returns {object} Normalized lifecycle changes.
 */
function normalizeLifecycleTimes(changes, transitionTime) {
	const normalized = { ...changes };
	if (Object.hasOwn(normalized, 'discoveredAtMs')) {
		normalized.discoveredAtMs = transitionTime;
	}
	if (Object.hasOwn(normalized, 'countdownStartedAtMs')) {
		normalized.countdownStartedAtMs = transitionTime;
	}
	return normalized;
}
