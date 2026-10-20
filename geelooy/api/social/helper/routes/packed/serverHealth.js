//B"H
//Blessed is He
//Boruch Hashem

/** @module ServerHealth
 * Event-loop yields and memory guards for the import path. Imports must
 * NEVER starve live web traffic (Yaakov, absolute law): workers yield
 * periodically and pause when the heap runs hot.
 */

const HEAP_GUARD_BYTES = 1200 * 1024 * 1024; // refuse new jobs above 1.2 GB


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

module.exports = { yieldTick, checkServerHealth, heapTooHigh, HEAP_GUARD_BYTES };
