// B"H
// Boruch Hashem
// Blessed is He

const assert = require("node:assert/strict");
const test = require("node:test");
const Watchdog = require("../lib/connection-vessel/parent-watchdog.js");

/**
 * @file Proves ingress and orphan custody recover without killing living execution.
 * @description
 * The Awtsmoos grants patience to deeds with a living consumer and Gevurah to deeds
 * whose consumer vanished. Awtsmoos.com lets stale custody trigger a new generation
 * only after the execution vessels are truly idle, preserving both safety and motion.
 */
test("stale unowned ingress triggers repair despite fresh pulse and pressure", () => {
	const signals = [];
	const watchdog = createWatchdog(() => 1000000, signals);
	watchdog.pulse(pressureStats());
	const result = watchdog.inspect({ registered: true }, {
		inbox: custody({ unownedCount: 1, unownedOldestAgeMs: 31000 })
	});

	assert.equal(result.execution.ingressStalled, true);
	assert.equal(result.execution.consumerStalled, true);
	assert.equal(result.shouldRepair, true);
	assert.equal(result.repairDeferred, false);
	assert.equal(result.repairReason, "execution_consumer_stalled");
	assert.deepEqual(signals, [{ pid: 4242, signal: "SIGTERM" }]);
});

test("stale parent custody with no living execution becomes an orphan and repairs", () => {
	const signals = [];
	const watchdog = createWatchdog(() => 2000000, signals);
	watchdog.pulse(quietStats());
	const result = watchdog.inspect({ registered: true }, {
		inbox: custody()
	});

	assert.equal(result.execution.ingressStalled, false);
	assert.equal(result.execution.orphanedCustody, true);
	assert.equal(result.execution.consumerStalled, true);
	assert.equal(result.shouldRepair, true);
	assert.equal(result.repairReason, "execution_consumer_stalled");
	assert.deepEqual(signals, [{ pid: 4242, signal: "SIGTERM" }]);
});

test("living execution protects stale custody from orphan recovery", () => {
	const signals = [];
	const watchdog = createWatchdog(() => 3000000, signals);
	watchdog.pulse(livingStats());
	const result = watchdog.inspect({ registered: true }, {
		inbox: custody()
	});

	assert.equal(result.execution.orphanedCustody, false);
	assert.equal(result.execution.consumerStalled, false);
	assert.equal(result.shouldRepair, false);
	assert.deepEqual(signals, []);
});

function custody(overrides = {}) {
	return {
		count: 7,
		parentCustodyCount: 7,
		parentCustodyOldestAgeMs: 90000,
		unownedCount: 0,
		unownedOldestAgeMs: 0,
		...overrides
	};
}

function pressureStats() {
	return {
		circuit: { level: "hard", representativeLagMs: 900 },
		eventLoopLag: { lastMs: 800, p90Ms: 900, maxMs: 9000 }
	};
}

function quietStats() {
	return {
		circuit: { level: "closed", representativeLagMs: 2 },
		eventLoopLag: { lastMs: 2, p90Ms: 3, maxMs: 9000 }
	};
}

function livingStats() {
	return {
		...quietStats(),
		inflight: 1,
		executionStages: {
			active: 1,
			consumerStarted: 1,
			waitingForConsumer: 0,
			oldestUnstartedAgeMs: 0
		}
	};
}

function createWatchdog(now, signals) {
	return Watchdog.create({
		parentPid: 4242,
		parentStaleMs: 30000,
		backlogStaleMs: 10000,
		consumerStaleMs: 30000,
		pressureGraceMs: 600000,
		startedAt: now(),
		now,
		signal: (pid, signal) => signals.push({ pid, signal }),
		recordLifecycle: () => true,
		setTimer: () => ({ unref() {} })
	});
}
