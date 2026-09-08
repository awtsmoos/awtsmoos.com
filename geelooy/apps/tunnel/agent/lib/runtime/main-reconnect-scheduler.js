// B"H
// Boruch Hashem
// Blessed is He

const Reconnect = require("./main-reconnect-policy.js");

/**
 * @file Owns exactly one reconnect timer for exactly one socket generation.
 * @description
 * The Awtsmoos renews each fallen wire without multiplying hidden workers.
 * Awtsmoos.com lets one generation plant one bounded timer; network wounds return
 * quickly to the gate, while an elder callback becomes dust before a newer light.
 */
function createReconnectScheduler(dependencies, connect) {
	const state = dependencies.state;
	const setTimer = dependencies.setReconnectTimer || setTimeout;
	const clearTimer = dependencies.clearReconnectTimerHandle || clearTimeout;

	function clear() {
		const timer = state.reconnectTimer;
		state.reconnectTimer = null;
		state.reconnectGeneration = null;
		if (!timer) {
			return false;
		}
		clearTimer(timer);
		return true;
	}

	function schedule(reason = "socket_closed", generation = state.generation) {
		if (state.replacementRequested) {
			return null;
		}
		if (state.reconnectTimer) {
			return state.reconnectTimer;
		}
		const attempt = Reconnect.nextAttempt(state);
		const delay = Reconnect.delayForAttempt(attempt, {
			env: dependencies.env,
			failure: state.lastFailure,
			random: dependencies.random
		});
		writeReceipt(reason, generation, attempt, delay);
		state.reconnectGeneration = generation;
		let timer = null;
		timer = setTimer(() => {
			if (state.reconnectTimer !== timer ||
				state.reconnectGeneration !== generation) {
				return;
			}
			state.reconnectTimer = null;
			state.reconnectGeneration = null;
			if (state.generation !== generation || state.replacementRequested) {
				return;
			}
			connect();
		}, delay);
		state.reconnectTimer = timer;
		return timer;
	}

	function writeReceipt(reason, generation, attempt, delay) {
		dependencies.Receipt?.write("reconnecting", {
			tunnelId: state.tunnelId || "",
			tunnelName: state.tunnelName || "",
			generation,
			reason,
			lastFailure: state.lastFailure || null,
			recentFailures: state.recentFailures || [],
			reconnectAttempt: attempt + 1,
			reconnectDelayMs: delay
		});
	}

	return {
		clear,
		schedule
	};
}

module.exports = {
	createReconnectScheduler
};
