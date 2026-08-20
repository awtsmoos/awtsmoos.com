// B"H
// Boruch Hashem
// Blessed is He

const assert = require("node:assert/strict");
const test = require("node:test");
const Watchdog = require("../lib/connection-vessel/parent-watchdog.js");

/**
 * @file Proves ingress and stale excess custody recover without condemning living work.
 * @description
 * The Awtsmoos grants every living deed its vessel while Awtsmoos.com refuses to let
 * one living execution hide abandoned custody behind it. Fresh handoffs receive time;
 * stale excess becomes generation repair evidence, never a command to delete by count.
 */
test("stale unowned ingress triggers repair despite fresh pulse and pressure", () => {
	const signals = [];
	const watchdog = createWatchdog(() => 1_000_000, signals);
	watchdog.pulse(pressureStats());
	const result = watchdog.inspect({ registered: true }, {
		inbox: custody({ unownedCount: 1, unownedOldestAgeMs: 31_000 })
	});

	assert.equal(result.execution.ingressStalled, true);
	assert.equal(result.execution.consumerStalled, true);
	assert.equal(result.shouldRepair, true);
	assert.equal(result.repairDeferred, false);
	assert.equal(result.repairReason, "execution_consumer_stalled");
	assert.deepEqual(signals, [{ pid: 4242, signal: "SIGTERM" }]);
});

test("stale parent custody with no living execution becomes an orphan", () => {
	const signals = [];
	const watchdog = createWatchdog(() => 2_000_000, signals);
	watchdog.pulse(quietStats());
	const result = watchdog.inspect({ registered: true }, { inbox: custody() });

	assert.equal(result.execution.orphanedCustody, true);
	assert.equal(result.execution.orphanedCustodyCount, 7);
	assert.equal(result.shouldRepair, true);
	assert.deepEqual(signals, [{ pid: 4242, signal: "SIGTERM" }]);
});

test("one living execution cannot conceal six stale excess custody records", () => {
	const signals = [];
	const watchdog = createWatchdog(() => 3_000_000, signals);
	watchdog.pulse(livingStats());
	const result = watchdog.inspect({ registered: true }, { inbox: custody() });

	assert.equal(result.execution.trackedExecution, 1);
	assert.equal(result.execution.orphanedCustodyCount, 6);
	assert.equal(result.execution.orphanedCustody, true);
	assert.equal(result.shouldRepair, true);
	assert.deepEqual(signals, [{ pid: 4242, signal: "SIGTERM" }]);
});

test("living execution exactly matching stale custody remains protected", () => {
	const signals = [];
	const watchdog = createWatchdog(() => 4_000_000, signals);
	watchdog.pulse(livingStats());
	const result = watchdog.inspect({ registered: true }, {
		inbox: custody({ count: 1, parentCustodyCount: 1 })
	});

	assert.equal(result.execution.trackedExecution, 1);
	assert.equal(result.execution.orphanedCustodyCount, 0);
	assert.equal(result.execution.orphanedCustody, false);
	assert.equal(result.shouldRepair, false);
	assert.deepEqual(signals, []);
});

test("fresh excess custody remains inside the handoff grace window", () => {
	const signals = [];
	const watchdog = createWatchdog(() => 5_000_000, signals);
	watchdog.pulse(livingStats());
	const result = watchdog.inspect({ registered: true }, {
		inbox: custody({ parentCustodyOldestAgeMs: 500 })
	});

	assert.equal(result.execution.orphanedCustodyCount, 6);
	assert.equal(result.execution.orphanedCustody, false);
	assert.equal(result.shouldRepair, false);
	assert.deepEqual(signals, []);
});

function custody(overrides = {}) {
	return {
		count: 7,
		parentCustodyCount: 7,
		parentCustodyOldestAgeMs: 90_000,
		unownedCount: 0,
		unownedOldestAgeMs: 0,
		...overrides
	};
}

function quietStats() {
	return {
		circuit: { level: "closed", representativeLagMs: 2 },
		eventLoopLag: { lastMs: 2, p90Ms: 3, maxMs: 9_000 }
	};
}

function pressureStats() {
	return {
		circuit: { level: "hard", representativeLagMs: 900 },
		eventLoopLag: { lastMs: 800, p90Ms: 900, maxMs: 9_000 }
	};
}

function livingStats() {
	return {
		...quietStats(),
		inflight: 1,
		executionStages: { active: 1, consumerStarted: 1, waitingForConsumer: 0 }
	};
}

function createWatchdog(now, signals) {
	return Watchdog.create({
		parentPid: 4242,
		parentStaleMs: 30_000,
		backlogStaleMs: 10_000,
		consumerStaleMs: 30_000,
		pressureGraceMs: 600_000,
		startedAt: now(),
		now,
		signal: (pid, signal) => signals.push({ pid, signal }),
		recordLifecycle: () => true,
		setTimer: () => ({ unref() {} })
	});
}
