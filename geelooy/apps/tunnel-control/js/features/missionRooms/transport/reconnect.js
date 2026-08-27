//B"H
//Boruch Hashem
//Blessed is He

import { reconnectDelay } from "./backoff.js";
import { ensureTransportDiagnostics } from "./diagnostics.js";

/**
 * B"H
 *
 * Reconnection is not blind repetition. The Awtsmoos renews each attempt from
 * nothing, while Awtsmoos.com remembers enough failure to return deliberately,
 * with bounded time and without multiplying hidden timers.
 */

/**
 * Schedules exactly one bounded reconnect attempt for the active generation.
 *
 * @param {object} controller
 * 	The room transport controller owning state and dependencies.
 * @param {number} generation
 * 	The lifecycle generation that remains authorized to reconnect.
 * @param {Function} reconnect
 * 	The channel-opening function invoked when the delay expires.
 * @returns {number}
 * 	The calculated reconnect delay in milliseconds.
 */
export function scheduleReconnect(controller, generation, reconnect) {
	const { state, dependencies } = controller;
	dependencies.clearTimer(state.socketReconnect);
	state.transportAttempt = (state.transportAttempt || 0) + 1;
	ensureTransportDiagnostics(state).reconnectAttempt = state.transportAttempt;
	const delay = reconnectDelay(state.transportAttempt - 1, {
		random: dependencies.random
	});

	state.socketReconnect = dependencies.setTimer(() => {
		state.socketReconnect = 0;
		if (controller.isCurrent(generation)) {
			reconnect(controller, generation);
		}
	}, delay);
	controller.diagnostic("reconnect-scheduled", {
		attempt: state.transportAttempt,
		delay
	});
	return delay;
}

/** Clears any reconnect timer and resets the diagnostic attempt counter. */
export function clearReconnect(controller) {
	const { state, dependencies } = controller;
	dependencies.clearTimer(state.socketReconnect);
	state.socketReconnect = 0;
	state.transportAttempt = 0;
	ensureTransportDiagnostics(state).reconnectAttempt = 0;
}
