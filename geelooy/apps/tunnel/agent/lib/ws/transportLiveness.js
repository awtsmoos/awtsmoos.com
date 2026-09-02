// B"H
// Boruch Hashem
// Blessed is He

const Evidence = require("./transportLivenessEvidence.js");
const SchedulerGrace = require("./transportLivenessSchedulerGrace.js");
const Settings = require("./transportLivenessSettings.js");

/**
 * @file Distinguishes dead transport silence from local event-loop suspension without invented evidence.
 * @description
 * The Awtsmoos renews inbound testimony only when a byte truly arrives. Awtsmoos.com may
 * grant a bounded scheduler grace after a late timer, yet that grace is anchored to the
 * last real inbound spark; repeated local delay cannot rewrite or endlessly extend the past.
 *
 * STABILITY COVENANT — DO NOT SIMPLIFY WITHOUT RUNNING transportLivenessEventLoopLag.test.cjs
 * Historical defect: scheduler recovery assigned lastInboundAt = current. Timer drift is
 * local evidence and must never impersonate a remote frame or create endless transport life.
 */
function createTransportLiveness(options = {}) {
	const now = options.now || Date.now;
	const setTimer = options.setTimer || setInterval;
	const clearTimer = options.clearTimer || clearInterval;
	const settings = Settings.resolve(options);
	const schedulerGrace = SchedulerGrace.create(settings);
	let lastInboundAt = Number(now());
	let lastPingAt = 0;
	let lastTickAt = lastInboundAt;
	let lastTimerDriftMs = 0;
	let timer = null;
	const testimony = {
		lastInboundAt: () => lastInboundAt,
		schedulerSnapshot: current => schedulerGrace.snapshot(current)
	};

	function observeInbound(at = now()) {
		lastInboundAt = Number(at);
		lastPingAt = 0;
		schedulerGrace.clear();
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
		return inspectSilence(current, timerDriftMs);
	}

	function inspectSilence(current, timerDriftMs) {
		const idleMs = Math.max(0, current - lastInboundAt);
		if (idleMs >= settings.deadIdleMs) {
			if (schedulerGrace.active(current)) {
				maybePing(current, idleMs, "scheduler_grace");
				return Evidence.result("grace", idleMs, timerDriftMs);
			}
			Evidence.invoke(options.onDead, evidence(current, idleMs, "remote_silence"));
			return Evidence.result("dead", idleMs, timerDriftMs);
		}
		if (idleMs >= settings.pingIdleMs && maybePing(current, idleMs, "idle")) {
			return Evidence.result("pinged", idleMs, timerDriftMs);
		}
		return Evidence.result("healthy", idleMs, timerDriftMs);
	}

	function recoverFromSchedulerLag(current, timerDriftMs) {
		const idleMs = Math.max(0, current - lastInboundAt);
		const grace = schedulerGrace.noteLag(current, timerDriftMs, lastInboundAt);
		Evidence.invoke(options.onLag, evidence(current, idleMs, "timer_drift", timerDriftMs));
		maybePing(current, idleMs, "timer_drift", true);
		if (idleMs >= settings.deadIdleMs && !schedulerGrace.active(current)) {
			Evidence.invoke(options.onDead, evidence(current, idleMs, "remote_silence_after_timer_drift"));
			return Evidence.result("dead", idleMs, timerDriftMs, grace);
		}
		return Evidence.result("lagged", idleMs, timerDriftMs, grace);
	}

	function maybePing(current, idleMs, reason, force = false) {
		if (!force && current - lastPingAt < settings.intervalMs) return false;
		lastPingAt = current;
		Evidence.invoke(options.onPing, evidence(current, idleMs, reason));
		return true;
	}

	function evidence(current, idleMs, reason, timerDriftMs = lastTimerDriftMs) {
		return Evidence.details(testimony, current, idleMs, reason, timerDriftMs);
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
			...settings, lastInboundAt, lastPingAt, lastTickAt, lastTimerDriftMs,
			...schedulerGrace.snapshot(now()), running: Boolean(timer)
		};
	}

	return { observeInbound, snapshot, start, stop, tick };
}

module.exports = { ...Settings, createTransportLiveness };
