// B"H
// Boruch Hashem
// Blessed is He

const Reconnect = require("./main-reconnect-policy.js");
const RemoteCloseCooldown = require("./main-remote-close-cooldown.js");

/**
 * @file Owns exactly one reconnect timer for exactly one socket generation.
 * @description
 * The Awtsmoos renews each fallen wire without multiplying hidden workers.
 * Awtsmoos.com lets one generation plant one bounded timer; repeated bare relay
 * closes receive a patient floor while every elder callback becomes dust.
 */
function createReconnectScheduler(dependencies, connect) {
	const state = dependencies.state;
	const setTimer = dependencies.setReconnectTimer || setTimeout;
	const clearTimer = dependencies.clearReconnectTimerHandle || clearTimeout;

	function clear() {
		const timer = state.reconnectTimer;
		state.reconnectTimer = null;
		state.reconnectGeneration = null;
		if (!timer) return false;
		clearTimer(timer);
		return true;
	}

	function schedule(reason = "socket_closed", generation = state.generation) {
		if (state.replacementRequested) return null;
		if (state.reconnectTimer) return state.reconnectTimer;
		const attempt = Reconnect.nextAttempt(state);
		const ordinaryDelay = Reconnect.delayForAttempt(attempt, {
			env: dependencies.env,
			failure: state.lastFailure,
			random: dependencies.random
		});
		const minimumDelay = RemoteCloseCooldown.minimumDelayForState(
			state,
			state.lastFailure,
			{ env: dependencies.env }
		);
		const delay = Math.max(ordinaryDelay, minimumDelay);
		writeReceipt(reason, generation, attempt, delay, minimumDelay);
		state.reconnectGeneration = generation;
		let timer = null;
		timer = setTimer(() => {
			if (state.reconnectTimer !== timer || state.reconnectGeneration !== generation) return;
			state.reconnectTimer = null;
			state.reconnectGeneration = null;
			if (state.generation !== generation || state.replacementRequested) return;
			connect();
		}, delay);
		state.reconnectTimer = timer;
		return timer;
	}

	function writeReceipt(reason, generation, attempt, delay, minimumDelay) {
		dependencies.Receipt?.write("reconnecting", {
			tunnelId: state.tunnelId || "",
			tunnelName: state.tunnelName || "",
			generation,
			reason,
			lastFailure: state.lastFailure || null,
			recentFailures: state.recentFailures || [],
			reconnectAttempt: attempt + 1,
			reconnectDelayMs: delay,
			reconnectMinimumDelayMs: minimumDelay,
			remoteClose1000Streak: state.remoteClose1000Streak || 0,
			remoteClose1000LastAt: state.remoteClose1000LastAt || 0,
			lastRegisteredDurationMs: state.lastRegisteredDurationMs || 0
		});
	}

	return { clear, schedule };
}

module.exports = { createReconnectScheduler };
