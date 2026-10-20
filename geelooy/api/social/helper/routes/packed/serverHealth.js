//B"H
//Blessed is He
//Boruch Hashem

/** @module ServerHealth
 * Event-loop yields, memory guards, and admission control for the
 * import path. Imports must NEVER starve live web traffic (Yaakov,
 * absolute law): workers yield periodically, pause when the heap runs
 * hot, and new jobs are refused fast when the box cannot take them.
 *
 * 2026-10-20 crash-guard rewrite:
 *  - HEAP_GUARD_BYTES was 1.2 GB, but the service runs with
 *    --max-old-space-size=1024, so V8 never lets the heap reach it:
 *    the guard could NEVER fire. Now 800 MB, inside the real limit.
 *  - admissionHealthy() is the single fail-fast gate for /start:
 *    one job at a time, heap headroom, SYSTEM free RAM headroom
 *    (the box is 2 GB total — OS + page cache matter as much as the
 *    heap), and the event-loop circuit breaker. Rejections are
 *    immediate structured errors with retryAfterMs — never a hang.
 */

const os = require('os');
const { runningJobsForHeichel } = require('./jobStore.js');
const { MAX_CONCURRENT_PER_HEICHEL } = require('./importBounds.js');
const { circuitOpen } = require('./eventLoopMonitor.js');

/** @constant {number} Refuse new jobs above this heap (inside V8's 1 GB cap). */
const HEAP_GUARD_BYTES = 800 * 1024 * 1024;
/** @constant {number} Refuse when OS free RAM drops below this. */
const SYS_FREE_MIN_BYTES = 200 * 1024 * 1024;

function yieldTick() { return new Promise(resolve => setImmediate(resolve)); }

// BH 2026-10-19: server health check - pause imports if server is struggling
// Imports must NEVER affect live site latency (user directive)
async function checkServerHealth() {
	try {
		const mem = process.memoryUsage();
		const heapUsedMB = mem.heapUsed / 1024 / 1024;
		const heapTotalMB = mem.heapTotal / 1024 / 1024;
		// If heap is >80% used, pause to let GC catch up
		if (heapUsedMB / heapTotalMB > 0.8) {
			await new Promise(r => setTimeout(r, 1000));
			return false;
		}
	} catch (_) {}
	return true;
}

function heapTooHigh() {
	try { return process.memoryUsage().heapUsed > HEAP_GUARD_BYTES; }
	catch (_) { return false; }
}

/**
 * True when the BOX (not just the heap) is out of headroom.
 * @returns {boolean}
 */
function systemMemLow() {
	try { return os.freemem() < SYS_FREE_MIN_BYTES; }
	catch (_) { return false; }
}

/**
 * Fail-fast admission for a new import job. Returns a verdict object:
 * ok=true, or ok=false with a stable error code and retryAfterMs.
 * The caller (@see startMixin) returns the rejection immediately —
 * the request is shed, the server never queues into a hang.
 * @param {string} heichelId
 * @returns {{ok:boolean, code?:string, retryAfterMs?:number, message?:string}}
 */
function admissionHealthy(heichelId) {
	const busy = runningJobsForHeichel(heichelId);
	if (busy.length >= MAX_CONCURRENT_PER_HEICHEL) {
		return { ok: false, code: 'IMPORT_BUSY', retryAfterMs: 30000,
			message: 'An import job is already running for this heichel. Only one job at a time on this server. Retry after the running job finishes.' };
	}
	if (heapTooHigh()) {
		return { ok: false, code: 'IMPORT_MEMORY_HIGH', retryAfterMs: 15000,
			message: 'Server heap is above the safe threshold for new import jobs. Retry shortly.' };
	}
	if (systemMemLow()) {
		return { ok: false, code: 'IMPORT_MEMORY_HIGH', retryAfterMs: 30000,
			message: 'System free memory is below 200 MB. New import jobs are refused until memory recovers.' };
	}
	if (circuitOpen()) {
		return { ok: false, code: 'IMPORT_CIRCUIT_OPEN', retryAfterMs: 20000,
			message: 'Event loop is overloaded (latency circuit breaker open). New import jobs are shed until it recovers.' };
	}
	return { ok: true };
}

module.exports = { yieldTick, checkServerHealth, heapTooHigh, systemMemLow,
	admissionHealthy, HEAP_GUARD_BYTES, SYS_FREE_MIN_BYTES };
