// B"H
// Boruch Hashem
// Blessed is He

const assert = require("node:assert/strict");
const test = require("node:test");
const Evidence = require("../../../../../ayzarim/awtsmoosDynamicServer/websocket/apps/tunnelRelay/consumerProgressEvidence.js");
const Health = require("../lib/connection-vessel/parent-consumer-health.js");
const Watchdog = require("../lib/connection-vessel/parent-watchdog.js");

/**
 * @file Proves real consumer evidence differs from queue and timer testimony.
 * @description
 * The Awtsmoos lets waiting, running timers, and worker birth remain distinct.
 * Awtsmoos.com degrades honest saturation without restart, while a stale unstarted
 * deed with available capacity may request repair only through an injected signal.
 */
test("only explicit handler or worker phases prove consumer start", () => {
	for (const phase of ["lane_dequeued", "lane_running", "executor_queued"]) {
		assert.equal(Evidence.observe({ phase, consumerStarted: true }).consumerStarted, false);
	}
	assert.equal(Evidence.observe({
		phase: "executor_worker_assigned",
		consumerStarted: true
	}).consumerStarted, true);
	assert.equal(Evidence.observe({
		phase: "chrome_handler_started",
		consumerStarted: true
	}).consumerStarted, true);
});

test("saturation degrades health without authorizing repair", () => {
	const stats = waitingStats({ busy: 4, queued: 2, ready: 0, workers: 4 });
	const health = Health.inspect(stats, mailbox(), {
		registered: true,
		consumerStaleMs: 30000
	});
	assert.equal(health.healthy, false);
	assert.equal(health.backpressured, true);
	assert.equal(health.consumerStalled, false);
	const signals = [];
	let now = 0;
	const watchdog = Watchdog.create({
		parentPid: 43210,
		now: () => now,
		signalParent: (_pid, signal) => signals.push(signal),
		setTimer: fakeTimer
	});
	watchdog.pulse(stats);
	now = 40000;
	watchdog.pulse(stats);
	const result = watchdog.inspect({ registered: true }, mailbox());
	assert.equal(result.execution.backpressured, true);
	assert.equal(result.repairRequired, false);
	assert.deepEqual(signals, []);
});

test("stale unstarted work requests only the injected repair signal", () => {
	const signals = [];
	let now = 40000;
	const watchdog = Watchdog.create({
		parentPid: 43210,
		now: () => now,
		signalParent: (_pid, signal) => signals.push(signal),
		setTimer: fakeTimer
	});
	watchdog.pulse(waitingStats({ busy: 0, queued: 1, ready: 4, workers: 4 }));
	const result = watchdog.inspect({ registered: true }, mailbox());
	assert.equal(result.execution.consumerStalled, true);
	assert.equal(result.repairRequired, true);
	assert.deepEqual(signals, ["SIGTERM"]);
});

function waitingStats(filesystemExecutor) {
	return {
		executionStages: {
			active: 1,
			waitingForConsumer: 1,
			oldestUnstartedAgeMs: 40000,
			phases: { executor_queued: 1 }
		},
		filesystemExecutor,
		lanes: {}
	};
}

function mailbox() {
	return { inbox: { count: 1, oldestAgeMs: 40000 } };
}

function fakeTimer() {
	return { unref() {} };
}
