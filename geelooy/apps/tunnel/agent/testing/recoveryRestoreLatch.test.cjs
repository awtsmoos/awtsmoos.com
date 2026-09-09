// B"H
// Boruch Hashem
// Blessed is He

const assert = require("node:assert/strict");
const State = require("../recovery/stateStore.js");
const Latch = require("../recovery/recoveryRestoreLatch.js");

/**
 * @file Proves stale self-healing state cannot become a permanent recovery storm.
 * @description
 * The Awtsmoos releases yesterday's network darkness when today's bytes are healthy,
 * yet Awtsmoos.com preserves recent crash testimony and actual integrity wounds until
 * their independent evidence is resolved.
 */
(() => {
	const now = Date.parse("2026-09-09T04:40:00.000Z");
	proveTransportClears(now);
	proveOldCrashLoopClears(now);
	proveRecentCrashLoopStays(now);
	proveActiveCrashStays(now);
	proveIntegrityFailureStays(now);
	proveSoftwareRestoreStays(now);
	console.log(JSON.stringify({ ok: true, suite: "recovery-restore-latch" }));
})();

/** Healthy bytes immediately release a restore request created only by DNS weather. */
function proveTransportClears(now) {
	const next = Latch.reconcile(state("registration_getaddrinfo_enotfound_awtsmoos.com"), healthy(), now);
	assert.equal(next.restoreRequired, false);
	assert.equal(next.lastRestoreReconciledCause, "transport_recovered");
}

/** A quiet crash loop older than the bounded recovery horizon no longer storms forever. */
function proveOldCrashLoopClears(now) {
	const current = state("rapid_crash_loop", { lastDowngradeAt: iso(now - Latch.STALE_CRASH_LOOP_MS - 1) });
	const next = Latch.reconcile(current, healthy(), now);
	assert.equal(next.restoreRequired, false);
	assert.equal(next.lastRestoreReconciledCause, "crash_loop_quiet");
}

/** Recent crash testimony remains fail-closed. */
function proveRecentCrashLoopStays(now) {
	const current = state("rapid_crash_loop", { lastDowngradeAt: iso(now - 60_000) });
	assert.equal(Latch.reconcile(current, healthy(), now).restoreRequired, true);
}

/** A still-accumulating crash counter can never be cleared by elapsed time. */
function proveActiveCrashStays(now) {
	const current = state("rapid_crash_loop", {
		lastDowngradeAt: iso(now - Latch.STALE_CRASH_LOOP_MS - 1),
		consecutiveFailures: 1
	});
	assert.equal(Latch.reconcile(current, healthy(), now).restoreRequired, true);
}

/** Bad current bytes keep every existing restore covenant. */
function proveIntegrityFailureStays(now) {
	const current = state("registration_getaddrinfo_enotfound_awtsmoos.com");
	assert.equal(Latch.reconcile(current, { ok: false }, now).restoreRequired, true);
}

/** A non-transport software restoration remains explicit until independently confirmed. */
function proveSoftwareRestoreStays(now) {
	assert.equal(Latch.reconcile(state("startup:manifest_mismatch"), healthy(), now).restoreRequired, true);
}

function state(reason, patch = {}) {
	return { ...State.defaults(), restoreRequired: true, restoreReason: reason, ...patch };
}
function healthy() { return { ok: true, failures: [] }; }
function iso(value) { return new Date(value).toISOString(); }
