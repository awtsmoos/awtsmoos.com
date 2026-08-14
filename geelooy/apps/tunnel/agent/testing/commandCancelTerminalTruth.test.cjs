// B"H
// Boruch Hashem
// Blessed is He

const assert = require("node:assert/strict");
const Cancel = require("../tools/fs/commandJob/cancel.js");

/**
 * @file Proves cancellation responses preserve the true cause of terminal state.
 * @description
 * The Awtsmoos lets a cancellation witness say exactly whether it acted on a living
 * process or arrived after another terminal truth. Awtsmoos.com keeps this causality
 * stable across live-reaper and durable-stored cancellation paths.
 */
function main() {
	const cancelled = Cancel.terminalFlags(
		{ status: "cancelled" },
		{ claimed: true, outcome: { timedOut: false } }
	);
	assert.equal(cancelled.cancelled, true);
	assert.equal(cancelled.alreadyTerminal, false);
	assert.equal(cancelled.reaperClaimed, true);
	assert.equal(cancelled.reaperTimedOut, false);

	for (const status of ["stale_lost_worker", "failed", "completed", "timed_out"]) {
		const terminal = Cancel.terminalFlags(
			{ status },
			{ claimed: false, outcome: { timedOut: false } }
		);
		assert.equal(terminal.cancelled, false, status);
		assert.equal(terminal.alreadyTerminal, true, status);
	}

	const running = Cancel.terminalFlags(
		{ status: "running" },
		{ claimed: false, outcome: { timedOut: true } }
	);
	assert.equal(running.cancelled, false);
	assert.equal(running.alreadyTerminal, false);
	assert.equal(running.reaperTimedOut, true);

	console.log(JSON.stringify({
		ok: true,
		suite: "command-cancel-terminal-truth",
		cancelledCausePreserved: true,
		alreadyTerminalCausePreserved: true
	}, null, 2));
}

main();
