//B"H
//Blessed is He
//Boruch Hashem

/**
 * @module ReadShed
 * @description
 * Read-side load shedding (safeguards program, Phase 3, 2026-10-20).
 *
 * WHY THIS EXISTS: admissionHealthy() (serverHealth.js) is the
 * fail-fast gate for IMPORT /start — it refuses new work when the
 * box is melting. Reads need the SAME fail-fast spirit but NOT the
 * same verdict: the IMPORT_BUSY job check must NEVER shed reads
 * (an import running is normal; a series page must keep serving
 * during one). So this module reuses ONLY the overload sensors —
 * event-loop circuit breaker, heap headroom, OS free RAM — and
 * sheds with a 503 + retry hint BEFORE the request does heavy
 * work (grouped rebuild, multi-series summarization).
 *
 * Shed verdicts are per-call (no state), never throw, and cost
 * microseconds: sensors already run on the loop monitor's timer.
 */

const { circuitOpen } = require('../routes/packed/eventLoopMonitor.js');
const { heapTooHigh, systemMemLow } = require('../routes/packed/serverHealth.js');

/**
 * One read-shed verdict check.
 * @returns {object|null} null when reads may proceed; otherwise a
 * stable shed verdict {code, retryAfterMs, message}.
 */
function readShed() {
	try {
		if (circuitOpen()) {
			return {
				code: 'READ_SHED_LOOP_OVERLOAD',
				retryAfterMs: 15000,
				message: 'The server is shedding heavy reads: the event-loop circuit breaker is open. Retry shortly.',
			};
		}
		if (heapTooHigh()) {
			return {
				code: 'READ_SHED_MEMORY_HIGH',
				retryAfterMs: 20000,
				message: 'The server is shedding heavy reads: heap is above the safe threshold. Retry shortly.',
			};
		}
		if (systemMemLow()) {
			return {
				code: 'READ_SHED_SYSTEM_LOW',
				retryAfterMs: 30000,
				message: 'The server is shedding heavy reads: system free memory is low. Retry shortly.',
			};
		}
	} catch (_) {
		/* A broken sensor must never block reads. */
	}
	return null;
}

/**
 * Cold-fill admission (B"H 2026-11-20, shed-warming fix).
 *
 * WHY THIS EXISTS: the memoized heavy reads (readCache consumers —
 * series post lists/details; the summaries cache) fill their cache
 * through the very read path this shed gates. The main process's
 * resting heap sits ABOVE the heap guard permanently on this 1.9GB
 * box, so under the original gate a cold cache could NEVER warm:
 * every request was refused before the single coalesced walk that
 * would have made every later request cheap. The protection
 * defeated the cure — series pages served the honest 503 forever
 * (measured live at load 0.52, heap verdict, 0.04s refusals).
 *
 * THE RULE: while the shed verdict stands, a gate may admit a
 * bounded number of cold fills — at most MAX_CONCURRENT_COLD_FILLS
 * walks in flight across the whole process — so caches warm one
 * walk at a time instead of stampeding or starving. Same-key
 * concurrent callers never consume budget: they are served by the
 * cache's own in-flight coalescing (peek / runShared). Everything
 * else keeps the original verdict: warm/stale answers are served,
 * non-admitted cold reads and all non-memoized heavy reads are
 * refused exactly as before. No threshold changes, no shed removal.
 *
 * A slot is held until the gate releases it (the fill settling) and
 * auto-releases after COLD_FILL_MAX_HOLD_MS so a stalled walk can
 * never leak the budget for the process lifetime. Admission never
 * throws: a broken admission path degrades to the honest refusal.
 */
const MAX_CONCURRENT_COLD_FILLS = 2;
const COLD_FILL_MAX_HOLD_MS = 120000;
let coldFillsInFlight = 0;

/**
 * Tries to admit one cold fill under an active shed verdict.
 * @returns {Function|null} an idempotent release function when the
 * fill is admitted, or null when the cold-fill budget is exhausted
 * (the caller must then answer with the shed refusal).
 */
function tryAdmitColdFill() {
	try {
		if (coldFillsInFlight >= MAX_CONCURRENT_COLD_FILLS) return null;
		coldFillsInFlight += 1;
		let released = false;
		let timer = null;
		const release = () => {
			if (released) return;
			released = true;
			if (timer) clearTimeout(timer);
			coldFillsInFlight = Math.max(0, coldFillsInFlight - 1);
		};
		timer = setTimeout(release, COLD_FILL_MAX_HOLD_MS);
		if (typeof timer.unref === 'function') timer.unref();
		return release;
	} catch (_) {
		/* Admission must never throw: degrade to the honest refusal. */
		return null;
	}
}

/** Current number of admitted cold fills in flight (diagnostics/tests). */
function coldFillsInFlightCount() {
	return coldFillsInFlight;
}

module.exports = {
	readShed,
	tryAdmitColdFill,
	coldFillsInFlightCount,
	MAX_CONCURRENT_COLD_FILLS
};
