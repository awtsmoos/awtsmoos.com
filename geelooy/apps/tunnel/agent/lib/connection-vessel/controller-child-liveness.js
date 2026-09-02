// B"H
// Boruch Hashem
// Blessed is He

const Policy = require("./controller-child-liveness-policy.js");

/**
 * @file Detects silent connection children only after the parent regains sustained punctual sight.
 * @description
 * The Awtsmoos renews messenger and listener while Awtsmoos.com refuses borrowed certainty:
 * parent scheduler delay creates a bounded judgment grace, never a fabricated child heartbeat.
 * Real IPC alone refreshes child evidence; only silence surviving a clean window earns repair.
 */
function create(options = {}) {
	const now = options.now || Date.now;
	const timing = Policy.create(options);
	let startedAt = now();
	let lastMessageAt = startedAt;
	let lastCheckAt = startedAt;
	let lastRestartAt = 0;
	let parentLagGraceUntil = 0;
	let hasMessage = false;

	/** Marks a new exact child generation without claiming that IPC has already arrived. */
	function started() {
		startedAt = now();
		lastMessageAt = startedAt;
		lastCheckAt = startedAt;
		parentLagGraceUntil = 0;
		hasMessage = false;
		return snapshot(startedAt, "child_started");
	}

	/** Records only genuine child IPC and immediately restores ordinary liveness judgment. */
	function note() {
		lastMessageAt = now();
		hasMessage = true;
		parentLagGraceUntil = 0;
		return snapshot(lastMessageAt, "child_message");
	}

	/** Authorizes replacement only after a full punctual observation window proves silence. */
	function inspect() {
		const observedAt = now();
		const checkGapMs = Math.max(0, observedAt - lastCheckAt);
		lastCheckAt = observedAt;
		if (Policy.parentDelayed(checkGapMs, timing.checkMs)) {
			parentLagGraceUntil = Math.max(
				parentLagGraceUntil,
				observedAt + timing.parentLagGraceMs
			);
			return snapshot(observedAt, "parent_event_loop_delayed");
		}
		if (observedAt < parentLagGraceUntil) {
			return snapshot(observedAt, "parent_lag_grace");
		}
		if (observedAt - startedAt < timing.startupGraceMs) {
			return snapshot(observedAt, "startup_grace");
		}
		const messageAgeMs = Math.max(0, observedAt - lastMessageAt);
		if (messageAgeMs < timing.staleMs) return snapshot(observedAt, "healthy");
		if (lastRestartAt && observedAt - lastRestartAt < timing.cooldownMs) {
			return snapshot(observedAt, "restart_cooldown");
		}
		lastRestartAt = observedAt;
		const reason = hasMessage ? "child_ipc_stalled" : "child_ipc_bootstrap_stalled";
		return {
			...snapshot(observedAt, reason),
			shouldRestart: true
		};
	}

	function status() {
		return snapshot(now(), "status");
	}

	function snapshot(observedAt, reason) {
		return {
			shouldRestart: false,
			reason,
			hasMessage,
			messageAgeMs: Math.max(0, observedAt - lastMessageAt),
			generationAgeMs: Math.max(0, observedAt - startedAt),
			parentLagGraceUntil,
			parentLagGraceRemainingMs: Math.max(0, parentLagGraceUntil - observedAt),
			...timing,
			lastRestartAt
		};
	}

	return {
		inspect,
		note,
		started,
		status
	};
}

module.exports = {
	DEFAULT_CHECK_MS: Policy.DEFAULT_CHECK_MS,
	DEFAULT_COOLDOWN_MS: Policy.DEFAULT_COOLDOWN_MS,
	DEFAULT_STALE_MS: Policy.DEFAULT_STALE_MS,
	DEFAULT_STARTUP_GRACE_MS: Policy.DEFAULT_STARTUP_GRACE_MS,
	create
};
