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

watchdog.pulse();
result = watchdog.inspect(
	{ registered: true },
	{ inbox: { count: 1, oldestAgeMs: 60000 } }
);
assert.equal(result.shouldRepair, false);
assert.equal(signals.length, 1);

const stalledSignals = [];
let clock = Date.now();
const stalled = Watchdog.create({
	parentPid: 5252,
	parentStaleMs: 60000,
	backlogStaleMs: 5000,
	controlStallMs: 10000,
	startedAt: clock,
	now: () => clock,
	signal: (pid, signal) => stalledSignals.push({ pid, signal }),
	setTimer: () => ({ unref() {} })
});
stalled.pulse({
	lanes: { p0_control: { inflight: 1, queued: 0 } },
	lastSuccessfulActionAt: 1
});
clock += 11000;
stalled.inspect(
	{ registered: true },
	{ inbox: { count: 4, oldestAgeMs: 60000 } }
);
assert.deepEqual(stalledSignals, [{ pid: 5252, signal: "SIGTERM" }]);

console.log(JSON.stringify({
	ok: true,
	suite: "connection-parent-watchdog",
	requiresLiveRegistrationAndOldBacklog: true,
	freshPulsePreventsRepair: true,
	liveHeartbeatWithSingleStuckControlActionRepairs: true
}));
