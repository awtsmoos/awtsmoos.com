// B"H

const assert = require("node:assert/strict");
const Watchdog = require("../lib/connection-vessel/parent-watchdog.js");

const signals = [];
const watchdog = Watchdog.create({
	parentPid: 4242,
	parentStaleMs: 5000,
	backlogStaleMs: 5000,
	controlStallMs: 10000,
	killGraceMs: 1000,
	startedAt: Date.now() - 60000,
	signal: (pid, signal) => signals.push({ pid, signal }),
	recordLifecycle: () => true,
	setTimer: callback => ({ callback, unref() {} })
});

let result = watchdog.inspect(
	{ registered: false },
	{ inbox: { count: 1, oldestAgeMs: 60000 } }
);
assert.equal(result.shouldRepair, false);
assert.equal(signals.length, 0);

result = watchdog.inspect(
	{ registered: true },
	{ inbox: { count: 1, oldestAgeMs: 60000 } }
);
assert.equal(result.shouldRepair, true);
assert.deepEqual(signals, [{ pid: 4242, signal: "SIGTERM" }]);

const pressureSignals = [];
let clock = 1000000;
const pressured = Watchdog.create({
	parentPid: 5252,
	parentStaleMs: 30000,
	backlogStaleMs: 5000,
	pressureGraceMs: 600000,
	startedAt: clock,
	now: () => clock,
	signal: (pid, signal) => pressureSignals.push({ pid, signal }),
	recordLifecycle: () => true,
	setTimer: () => ({ unref() {} })
});
pressured.pulse({
	circuit: { level: "hard", pressureLagMs: 3751 },
	eventLoopLag: { lastMs: 933, maxMs: 3751 },
	executionStages: { active: 7, waitingForConsumer: 2 },
	inflight: 7,
	queued: 1
});
clock += 31000;
result = pressured.inspect(
	{ registered: true },
	{ inbox: { count: 17, oldestAgeMs: 49592935 } }
);
assert.equal(result.shouldRepair, false);
assert.equal(result.repairDeferred, true);
assert.equal(result.repairDeferredReason, "runtime_pressure");
assert.equal(pressureSignals.length, 0);

clock += 570000;
result = pressured.inspect(
	{ registered: true },
	{ inbox: { count: 17, oldestAgeMs: 50162935 } }
);
assert.equal(result.shouldRepair, true);
assert.deepEqual(pressureSignals, [{ pid: 5252, signal: "SIGTERM" }]);

console.log(JSON.stringify({
	ok: true,
	suite: "connection-parent-watchdog",
	deadIdleParentRepairs: true,
	pressureDefersRepair: true,
	boundedPressureGrace: true
}));
