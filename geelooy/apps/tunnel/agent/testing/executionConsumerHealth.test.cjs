// B"H
// Boruch Hashem
// Blessed is He

const assert = require("node:assert/strict");
const test = require("node:test");
const Evidence = require("../../../../../ayzarim/awtsmoosDynamicServer/websocket/apps/tunnelRelay/consumerProgressEvidence.js");
const Health = require("../lib/connection-vessel/parent-consumer-health.js");
const Watchdog = require("../lib/connection-vessel/parent-watchdog.js");

/**
 * @file Proves running truth, honest saturation, and true dead-consumer repair remain distinct.
 * @description
 * The Awtsmoos renews each beat without calling labor death or silence labor.
 * Awtsmoos.com grants saturated workers patience, yet repairs a proven abandoned queue
 * whose workers stand ready while no consumer carries the waiting deed forward.
 */
test("running and handler phases prove consumer start", () => {
	for (const phase of ["lane_dequeued", "executor_queued"]) {
		assert.equal(Evidence.observe({ phase, consumerStarted: true }).consumerStarted, false);
	}
	for (const phase of [
		"executor_worker_assigned",
		"lane_running",
		"lane_advisory_overtime",
		"chrome_handler_started"
	]) {
		assert.equal(Evidence.observe({ phase, consumerStarted: true }).consumerStarted, true);
	}
});

test("started evidence never regresses when stale queue progress arrives", () => {
	const running = Evidence.observe({ phase: "lane_running", consumerStarted: true });
	const staleQueue = Evidence.observe({ phase: "executor_queued", queued: true });
	const merged = Evidence.merge(running, staleQueue);
	assert.equal(merged.consumerStarted, true);
	assert.equal(merged.queued, false);
});

test("saturation degrades health without authorizing repair", () => {
	const stats = waitingStats({ busy: 4, queued: 2, ready: 0, workers: 4 });
	const health = Health.inspect(stats, mailbox(), { registered: true, consumerStaleMs: 30000 });
	assert.equal(health.healthy, false);
	assert.equal(health.backpressured, true);
	assert.equal(health.consumerStalled, false);
	const signals = [];
	const watchdog = createWatchdog(signals);
	watchdog.pulse(stats);
	const result = watchdog.inspect({ registered: true }, mailbox());
	assert.equal(result.execution.backpressured, true);
	assert.equal(result.repairRequired, false);
	assert.deepEqual(signals, []);
});

test("proven consumer stall bypasses backlog pressure and repairs immediately", () => {
	const stats = waitingStats({ busy: 0, queued: 1, ready: 4, workers: 4 });
	const signals = [];
	const watchdog = createWatchdog(signals);
	watchdog.pulse(stats);
	const result = watchdog.inspect({ registered: true }, mailbox());
	assert.equal(result.execution.consumerStalled, true);
	assert.equal(result.execution.backpressured, false);
	assert.equal(result.repairRequired, true);
	assert.equal(result.repairDeferred, false);
	assert.deepEqual(signals, ["SIGTERM"]);
});

function createWatchdog(signals) {
	return Watchdog.create({
		parentPid: 43210,
		now: () => 40000,
		signalParent: (_pid, signal) => signals.push(signal),
		setTimer: fakeTimer
	});
}

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
