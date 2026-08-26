// B"H
// Boruch Hashem
// Blessed is He

const DEFAULT_STALE_MS = 15000;
const DEFAULT_CHECK_MS = 1000;
const DEFAULT_COOLDOWN_MS = 30000;
const DEFAULT_STARTUP_GRACE_MS = 10000;

/**
 * @file Detects a living-but-silent connection child without mistaking parent lag for death.
 * @description
 * The Awtsmoos renews both messenger and listener; Awtsmoos.com therefore waits for
 * repeated silence while the listener itself remains punctual. A delayed parent clock
 * cannot condemn the child before queued IPC has one fresh interval to manifest.
 */
function create(options = {}) {
	const now = options.now || Date.now;
	const staleMs = bounded(options.staleMs, DEFAULT_STALE_MS, 5000);
	const checkMs = bounded(options.checkMs, DEFAULT_CHECK_MS, 250);
	const cooldownMs = bounded(options.cooldownMs, DEFAULT_COOLDOWN_MS, staleMs);
	const startupGraceMs = bounded(options.startupGraceMs, DEFAULT_STARTUP_GRACE_MS, checkMs);
	let startedAt = now();
	let lastMessageAt = startedAt;
	let lastCheckAt = startedAt;
	let lastRestartAt = 0;
	let delayedParentCycle = false;

	/** Marks a newly forked child generation as alive during its bounded startup covenant. */
	function started() {
		startedAt = now();
		lastMessageAt = startedAt;
		lastCheckAt = startedAt;
		delayedParentCycle = false;
		return snapshot(startedAt, "child_started");
	}

	/** Records any valid child IPC message as proof that the connection vessel is moving. */
	function note() {
		lastMessageAt = now();
		delayedParentCycle = false;
		return snapshot(lastMessageAt, "child_message");
	}

	/**
	 * Determines whether exact-child replacement is justified now.
	 * @returns {object} Stable liveness evidence and `shouldRestart` authorization.
	 */
	function inspect() {
		const observedAt = now();
		const checkGapMs = Math.max(0, observedAt - lastCheckAt);
		lastCheckAt = observedAt;
		if (checkGapMs > checkMs * 4) {
			delayedParentCycle = true;
			return snapshot(observedAt, "parent_event_loop_delayed");
		}
		if (delayedParentCycle) {
			delayedParentCycle = false;
			return snapshot(observedAt, "post_lag_grace");
		}
		if (observedAt - startedAt < startupGraceMs) {
			return snapshot(observedAt, "startup_grace");
		}
		const messageAgeMs = Math.max(0, observedAt - lastMessageAt);
		if (messageAgeMs < staleMs) return snapshot(observedAt, "healthy");
		if (lastRestartAt && observedAt - lastRestartAt < cooldownMs) {
			return snapshot(observedAt, "restart_cooldown");
		}
		lastRestartAt = observedAt;
		return {
			...snapshot(observedAt, "child_ipc_stalled"),
			shouldRestart: true
		};
	}

	/** Returns current timing evidence without authorizing another replacement. */
	function status() {
		return snapshot(now(), "status");
	}

	function snapshot(observedAt, reason) {
		return {
			shouldRestart: false,
			reason,
			messageAgeMs: Math.max(0, observedAt - lastMessageAt),
			generationAgeMs: Math.max(0, observedAt - startedAt),
			staleMs,
			checkMs,
			cooldownMs,
			startupGraceMs,
			lastRestartAt
		};
	}

	return { inspect, note, started, status };
}

function bounded(value, fallback, minimum) {
	const number = Number(value);
	return Number.isFinite(number)
		? Math.max(minimum, Math.floor(number))
		: fallback;
}

module.exports = {
	DEFAULT_CHECK_MS,
	DEFAULT_COOLDOWN_MS,
	DEFAULT_STALE_MS,
	DEFAULT_STARTUP_GRACE_MS,
	create
};
