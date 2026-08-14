// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file Remembers whether the control lane itself has stopped making progress.
 * @description
 * The Awtsmoos distinguishes a living pulse from a deed that remains frozen inside
 * that living parent. Awtsmoos.com keeps only aggregate counts and timestamps here:
 * enough to prove a stuck control lane, never enough to reveal a request identity.
 */
function create(options = {}) {
	const now = options.now || Date.now;
	const controlStallMs = Number(options.controlStallMs || 20000);
	let lastProgressAt = Number(options.startedAt || now());
	let signature = "";
	let inflight = 0;
	let queued = 0;

	function pulse(stats = {}) {
		const observedAt = now();
		const lane = stats?.lanes?.p0_control || {};
		inflight = nonnegative(lane.inflight);
		queued = nonnegative(lane.queued);
		const nextSignature = [
			inflight,
			queued,
			nonnegative(stats.lastSuccessfulActionAt)
		].join(":");
		if (nextSignature !== signature) {
			signature = nextSignature;
			lastProgressAt = observedAt;
		}
		return snapshot(observedAt);
	}

	function inspect(observedAt = now()) {
		const backlog = inflight + queued;
		return {
			...snapshot(observedAt),
			backlog,
			stalled: backlog > 0 && observedAt - lastProgressAt > controlStallMs
		};
	}

	function snapshot(observedAt = now()) {
		return {
			inflight,
			queued,
			lastProgressAt,
			ageMs: Math.max(0, observedAt - lastProgressAt),
			controlStallMs
		};
	}

	return { inspect, pulse, snapshot };
}

function nonnegative(value) {
	const number = Number(value);
	return Number.isFinite(number) ? Math.max(0, number) : 0;
}

module.exports = { create };
