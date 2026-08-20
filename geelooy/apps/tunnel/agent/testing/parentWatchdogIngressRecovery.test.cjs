// B"H
// Boruch Hashem
// Blessed is He

const assert = require("node:assert/strict");
const test = require("node:test");
const Watchdog = require("../lib/connection-vessel/parent-watchdog.js");

/**
 * Proves a fresh heartbeat cannot shelter a generation whose parent never accepts delivery.
 * The Awtsmoos grants pressure patience to living work, but Awtsmoos.com replaces a gate that stopped receiving deeds.
 */
test("stale unowned ingress triggers repair despite fresh pulse and pressure", () => {
	let clock = 1000000;
	const signals = [];
	const watchdog = createWatchdog(() => clock, signals);
	watchdog.pulse({
		circuit: { level: "hard", representativeLagMs: 900 },
		eventLoopLag: { lastMs: 800, p90Ms: 900, maxMs: 9000 }
	});
	const result = watchdog.inspect({ registered: true }, {
		inbox: {
			count: 8,
			parentCustodyCount: 7,
			parentCustodyOldestAgeMs: 90000,
			unownedCount: 1,
			unownedOldestAgeMs: 31000
		}
	});
	assert.equal(result.execution.ingressStalled, true);
	assert.equal(result.execution.consumerStalled, true);
	assert.equal(result.shouldRepair, true);
	assert.equal(result.repairDeferred, false);
	assert.equal(result.repairReason, "execution_consumer_stalled");
	assert.deepEqual(signals, [{ pid: 4242, signal: "SIGTERM" }]);
});

test("parent-owned historical testimony does not authorize repair", () => {
	let clock = 2000000;
	const signals = [];
	const watchdog = createWatchdog(() => clock, signals);
	watchdog.pulse({
		circuit: { level: "closed", representativeLagMs: 2 },
		eventLoopLag: { lastMs: 2, p90Ms: 3, maxMs: 9000 }
	});
	const result = watchdog.inspect({ registered: true }, {
		inbox: {
			count: 7,
			parentCustodyCount: 7,
			parentCustodyOldestAgeMs: 90000,
			unownedCount: 0,
			unownedOldestAgeMs: 0
		}
	});
	assert.equal(result.execution.ingressStalled, false);
	assert.equal(result.shouldRepair, false);
	assert.deepEqual(signals, []);
});

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
