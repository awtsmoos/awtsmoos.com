//B"H
// Boruch Hashem
// Blessed is He

const assert = require("node:assert/strict");
const {
	createRig,
	PRIMARY_TUNNEL,
	TOTAL_BUDGET_MS
} = require("./restartTortureHarness.cjs");

/**
 * @file Restart/reinstall torture test for the tunnel reliability fixes.
 * @description
 * Proves the other workers' reliability fixes hold under repeated
 * restart/reinstall cycles. Twenty-four deterministic cycles drive the REAL
 * modules: boot-resume policy and supervisor promotion/handoff classification,
 * mailbox write/verify/remove, the HTTP singleton acquire/release, route
 * promotion, and the watchdog reconnect decision. Cycles interleave admitted
 * commands, filesystem activity, and idle periods, and include crash
 * (stale-lock quarantine) and reinstall (fresh root) variants. After every
 * cycle the full invariant set is asserted: exactly one owner, identity
 * preserved (tunnel awt-awtsmoos-2184), zero uncaught mailbox ENOENTs, zero
 * EADDRINUSE crashes, zero lost commands, bounded logs, and recovery inside
 * the time budget. Deterministic seed: no flakes.
 */

(async () => {
	const rig = createRig({ seed: 0xA77D10 });
	await rig.controls();

	const CYCLES = 24;
	const startedAt = Date.now();
	for (let index = 0; index < CYCLES; index += 1) {
		await rig.cycle(index);
	}
	const totalMs = Date.now() - startedAt;
	assert(totalMs < TOTAL_BUDGET_MS, `torture run exceeded total budget: ${totalMs}ms`);

	const summary = rig.finish();
	assert.equal(summary.cycles, CYCLES, "cycle count mismatch");
	assert.equal(summary.receipts, summary.admitted, "lost commands in final tally");
	assert.equal(summary.pending, 0, "in-flight commands left undrained");
	assert.equal(summary.identity, PRIMARY_TUNNEL, "tunnel identity not preserved");

	console.log(JSON.stringify({ ok: true, totalMs, totalBudgetMs: TOTAL_BUDGET_MS, ...summary }));
})().catch((error) => {
	console.error(error && error.stack ? error.stack : error);
	process.exit(1);
});
