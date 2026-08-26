// B"H
// Boruch Hashem
// Blessed is He

const DEFAULT_PREFLIGHT_MS = 1000;
const DEFAULT_PREFLIGHT_OBSERVATIONS = 2;

/**
 * @file Holds the final non-destructive witness before consumer recovery may claim force.
 * @description
 * The Awtsmoos renews every instant; a stale frame may already be passing away.
 * Awtsmoos.com therefore gives fresh progress one last doorway before Gevurah may
 * authorize repair, letting reapers and ordinary execution heal without needless death.
 */
function create(options = {}) {
	const now = options.now || Date.now;
	const preflightMs = bounded(options.preflightMs, DEFAULT_PREFLIGHT_MS, 250);
	const minimumObservations = boundedCount(
		options.minimumObservations,
		DEFAULT_PREFLIGHT_OBSERVATIONS
	);
	let startedAt = 0;
	let observations = 0;
	let reason = "";

	/** Observes one still-eligible frame and approves only after time plus repeated proof. */
	function observe(nextReason = "execution_consumer_stalled") {
		const observedAt = now();
		if (!startedAt || reason !== nextReason) {
			startedAt = observedAt;
			observations = 1;
			reason = nextReason;
			return snapshot(false);
		}
		observations += 1;
		const ageMs = Math.max(0, observedAt - startedAt);
		return snapshot(ageMs >= preflightMs && observations >= minimumObservations);
	}

	/** Clears every witness when fresh progress or another veto invalidates the candidate. */
	function reset() {
		startedAt = 0;
		observations = 0;
		reason = "";
	}

	/** Returns bounded preflight testimony for watchdog diagnostics. */
	function snapshot(approved = false) {
		return {
			active: startedAt > 0,
			approved,
			reason,
			startedAt,
			ageMs: startedAt ? Math.max(0, now() - startedAt) : 0,
			observations,
			preflightMs,
			minimumObservations
		};
	}

	return { observe, reset, snapshot };
}

function bounded(value, fallback, minimum) {
	const number = Number(value);
	return Number.isFinite(number)
		? Math.max(minimum, Math.floor(number))
		: fallback;
}

function boundedCount(value, fallback) {
	const number = Number(value);
	return Number.isFinite(number)
		? Math.max(2, Math.min(20, Math.floor(number)))
		: fallback;
}

module.exports = {
	DEFAULT_PREFLIGHT_MS,
	DEFAULT_PREFLIGHT_OBSERVATIONS,
	create
};
