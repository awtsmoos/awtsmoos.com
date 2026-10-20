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

module.exports = { readShed };
