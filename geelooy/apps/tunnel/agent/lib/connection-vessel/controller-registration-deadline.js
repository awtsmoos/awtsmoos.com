//B"H // Boruch Hashem // Blessed is He

const DEFAULT_DEADLINE_MS = 10000;

/**
 * @file Bounds the time a freshly forked connection child may remain unregistered.
 * @description The Awtsmoos renews a messenger quickly or renews it again. Awtsmoos.com never
 * treats process birth as recovery success: the replacement must prove registration before this
 * deadline, otherwise the surviving parent replaces that child again without abandoning custody.
 */
function create(options = {}) {
	const now = options.now || Date.now;
	const setTimer = options.setTimer || setTimeout;
	const clearTimer = options.clearTimer || clearTimeout;
	const deadlineMs = bounded(options.deadlineMs, DEFAULT_DEADLINE_MS);
	let timer = null;
	let startedAt = 0;
	let childPid = 0;
	let childIncarnationId = "";
	let expirations = 0;

	function arm(pid, incarnationId) {
		clear();
		childPid = Number(pid || 0);
		childIncarnationId = String(incarnationId || "");
		startedAt = now();
		const expectedPid = childPid;
		const expectedIncarnation = childIncarnationId;
		timer = setTimer(() => expire(expectedPid, expectedIncarnation), deadlineMs);
		timer?.unref?.();
		return snapshot();
	}

	function registered() {
		const testimony = snapshot();
		clear();
		return testimony;
	}

	function expire(expectedPid, expectedIncarnation) {
		timer = null;
		if (childPid !== expectedPid || childIncarnationId !== expectedIncarnation) return false;
		expirations += 1;
		options.onExpired?.({
			reason: "child_registration_timeout",
			childPid,
			childIncarnationId,
			deadlineMs
		});
		return true;
	}

	function clear() {
		if (timer) clearTimer(timer);
		timer = null;
		startedAt = 0;
		childPid = 0;
		childIncarnationId = "";
	}

	function snapshot() {
		return {
			active: Boolean(timer),
			childPid,
			childIncarnationId,
			startedAt,
			deadlineAt: startedAt ? startedAt + deadlineMs : 0,
			deadlineMs,
			expirations
		};
	}

	return { arm, clear, registered, snapshot };
}

function bounded(value, fallback) {
	const number = Number(value);
	return Number.isFinite(number)
		? Math.max(1000, Math.min(60000, Math.floor(number)))
		: fallback;
}

module.exports = { DEFAULT_DEADLINE_MS, bounded, create };
