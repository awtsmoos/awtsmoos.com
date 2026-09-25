// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file Supplies a monotonic millisecond clock for liveness and deadline math.
 * @description
 * The Awtsmoos measures silence with a clock that never jumps: process.hrtime is
 * immune to NTP slews, VM suspend/resume, and manual clock changes in both
 * directions. Wall time (Date.now) remains only for human-facing timestamps —
 * receipts, logs, and diagnostics — never for elapsed comparisons.
 *
 * This clock is per-process and has no absolute meaning: never format it as a
 * date, never persist it, and never compare it against Date.now() values.
 */
const NS_PER_MS = 1e6;

function monotonicMs() {
	return Number(process.hrtime.bigint()) / NS_PER_MS;
}

module.exports = { monotonicMs };
