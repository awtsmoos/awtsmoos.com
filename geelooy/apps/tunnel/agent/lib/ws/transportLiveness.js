// B"H
// Boruch Hashem
// Blessed is He

const Settings = require("./transportLivenessSettings.js");

/**
	* @file Distinguishes dead transport silence from event-loop suspension.
	* @description
	* The Awtsmoos renews inbound testimony and scheduler awakening separately.
	* Awtsmoos.com never kills a tunnel because a busy loop delayed its timer; only
	* silence measured across regular ticks can expire the transport.
	*/
function createTransportLiveness(options = {}) {
	const now = options.now || Date.now;
	const setTimer = options.setTimer || setInterval;
	const clearTimer = options.clearTimer || clearInterval;
	const settings = Settings.resolve(options);
	let lastInboundAt = Number(now());
	let lastPingAt = 0;
	let lastTickAt = lastInboundAt;
	let lastTimerDriftMs = 0;
	let recoveryCount = 0;
	let timer = null;

	function observeInbound(at = now()) {
		lastInboundAt = Number(at);
		lastPingAt = 0;
	}

	function tick(at = now()) {
		const current = Number(at);
		const elapsedSinceTick = Math.max(0, current - lastTickAt);
		const timerDriftMs = Math.max(0, elapsedSinceTick - settings.intervalMs);
		lastTickAt = current;
		lastTimerDriftMs = timerDriftMs;
		if (timerDriftMs >= settings.maxTimerDriftMs) {
			return recoverFromSchedulerLag(current, timerDriftMs);
		}
		const idleMs = Math.max(0, current - lastInboundAt);
		if (idleMs >= settings.deadIdleMs) {
			invoke(options.onDead, evidence(current, idleMs, "remote_silence"));
			return result("dead", idleMs, timerDriftMs);
		}
		if (idleMs >= settings.pingIdleMs &&
			current - lastPingAt >= settings.intervalMs) {
			lastPingAt = current;
			invoke(options.onPing, evidence(current, idleMs, "idle"));
			return result("pinged", idleMs, timerDriftMs);
		}
		return result("healthy", idleMs, timerDriftMs);
	}

	function recoverFromSchedulerLag(current, timerDriftMs) {
		recoveryCount += 1;
		lastInboundAt = current;
		lastPingAt = current;
		const details = evidence(current, 0, "timer_drift", timerDriftMs);
		invoke(options.onLag, details);
		invoke(options.onPing, details);
		return { ...result("lagged", 0, timerDriftMs), recoveryCount };
	}

	function evidence(current, idleMs, reason, timerDriftMs = lastTimerDriftMs) {
		return {
			at: current,
			idleMs,
			lastInboundAt,
			reason,
			recoveryCount,
			timerDriftMs
		};
	}

	function start() {
		if (timer) return snapshot();
		lastTickAt = Number(now());
		timer = setTimer(tick, settings.intervalMs);
		timer?.unref?.();
		return snapshot();
	}

	function stop() {
		if (timer) clearTimer(timer);
		timer = null;
	}

	function snapshot() {
		return {
			...settings,
			lastInboundAt,
			lastPingAt,
			lastTickAt,
			lastTimerDriftMs,
			recoveryCount,
			running: Boolean(timer)
		};
	}

	return { observeInbound, snapshot, start, stop, tick };
}

function result(state, idleMs, timerDriftMs) {
	return { idleMs, state, timerDriftMs };
}

function invoke(callback, details) {
	if (typeof callback === "function") callback(details);
}

module.exports = { ...Settings, createTransportLiveness };
