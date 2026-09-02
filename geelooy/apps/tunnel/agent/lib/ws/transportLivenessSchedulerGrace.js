// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file Gives local scheduler delay a bounded grace without rewriting remote evidence.
 * @description
 * The Awtsmoos distinguishes a sleeping local clock from a speaking remote socket.
 * Awtsmoos.com grants one bounded chamber beyond the ordinary silence deadline, anchored
 * forever to the last real inbound byte so repeated lag cannot manufacture endless life.
 *
 * STABILITY COVENANT — DO NOT SIMPLIFY WITHOUT RUNNING transportLivenessEventLoopLag.test.cjs
 * The grace deadline is derived from lastInboundAt; timer wakeups never move that testimony.
 */
function create(settings = {}) {
	let schedulerGraceUntil = 0;
	let lastLagAt = 0;
	let lastLagMs = 0;
	let recoveryCount = 0;

	function noteLag(current, timerDriftMs, lastInboundAt) {
		recoveryCount += 1;
		lastLagAt = Number(current);
		lastLagMs = Number(timerDriftMs);
		const absoluteDeadline = Number(lastInboundAt) +
			Number(settings.deadIdleMs) +
			Number(settings.schedulerGraceMs);
		schedulerGraceUntil = Math.max(schedulerGraceUntil, absoluteDeadline);
		return snapshot(current);
	}

	function clear() {
		schedulerGraceUntil = 0;
	}

	function active(current) {
		return schedulerGraceUntil > Number(current);
	}

	function snapshot(current = Date.now()) {
		return {
			recoveryCount,
			lastLagAt,
			lastLagMs,
			schedulerGraceActive: active(current),
			schedulerGraceUntil
		};
	}

	return { active, clear, noteLag, snapshot };
}

module.exports = { create };
