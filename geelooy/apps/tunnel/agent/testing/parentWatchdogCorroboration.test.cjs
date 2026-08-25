// B"H
// Boruch Hashem
// Blessed is He

const assert = require("node:assert/strict");
const Consumer = require("../lib/connection-vessel/parent-consumer-health.js");
const Watchdog = require("../lib/connection-vessel/parent-watchdog-values.js");

/**
 * @file Proves stale custody cannot kill a living generation without corroboration.
 * @description
 * The Awtsmoos keeps old testimony visible while fresh deeds testify that the vessel
 * still moves. Awtsmoos.com requires parent or control silence before SIGTERM authority exists.
 */
const now = 1_000_000;
const staleStats = {
	lastSuccessfulActionAt: now - 1000,
	executionStages: {
		active: 1,
		consumerStarted: 0,
		waitingForConsumer: 1,
		oldestUnstartedAgeMs: 40000,
		phases: { accepted_waiting_for_consumer: 1 }
	},
	filesystemExecutor: { busy: 0, queued: 0, ready: 4, workers: 4 },
	lanes: {}
};
const staleMailbox = {
	inbox: {
		count: 1,
		parentCustodyCount: 1,
		parentCustodyOldestAgeMs: 40000,
		parentCustodyRecords: []
	}
};

const degraded = Consumer.inspect(staleStats, staleMailbox, {
	registered: true,
	orphanRecovery: true,
	now: () => now
});
assert.equal(degraded.consumerStalled, false);
assert.equal(degraded.degradedCustody, true);
assert.equal(degraded.healthy, true);
assert.equal(degraded.state, "consumer_degraded");

const stalled = Consumer.inspect({
	...staleStats,
	lastSuccessfulActionAt: now - 40000
}, staleMailbox, {
	registered: true,
	orphanRecovery: true,
	now: () => now
});
assert.equal(stalled.consumerStalled, true);

const warningOnly = Watchdog.inspection({
	registered: true,
	unresolved: 1,
	acceptedAgeMs: 40000,
	backlogStaleMs: 10000,
	parentAgeMs: 1000,
	parentStaleMs: 30000,
	controlStalled: false,
	execution: stalled
});
assert.equal(warningOnly.repairRequired, false);
assert.equal(warningOnly.repairReason, "");
assert.equal(warningOnly.warningReason, "execution_consumer_stalled");

const deadParent = Watchdog.inspection({
	registered: true,
	unresolved: 1,
	acceptedAgeMs: 40000,
	backlogStaleMs: 10000,
	parentAgeMs: 40000,
	parentStaleMs: 30000,
	controlStalled: false,
	execution: stalled
});
assert.equal(deadParent.repairRequired, true);
assert.equal(deadParent.repairReason, "execution_parent_unresponsive");

assert.equal(
	Watchdog.reasonFor(false, { consumerStalled: true }, true),
	"execution_control_stalled"
);
console.log(JSON.stringify({ ok: true, suite: "parent-watchdog-corroboration" }));
