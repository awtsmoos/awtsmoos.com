// B"H
// Boruch Hashem
// Blessed is He

const assert = require("node:assert/strict");
const test = require("node:test");
const ProgressInterval = require("../lib/runtime/progress-interval.js");
const { createQueueProgress } = require("../lib/runtime/main-queue-progress.js");
const { startRunProgress } = require("../lib/runtime/main-run-progress.js");

test("accepted work renews progress faster than the relay watchdog", t => {
	const intervals = captureIntervals(t);
	const frames = [];
	const dependencies = fixtures(frames);
	createQueueProgress(dependencies).start({
		ws: { opened: true },
		data: { id: "queued", payload: { action: "write" } },
		enqueuedAt: Date.now(),
		queueKeepalive: null
	}, "p1_fs_light");
	startRunProgress(dependencies, {
		ws: { opened: false },
		data: { id: "running" },
		payload: { action: "commandRun" },
		lane: "p3_heavy",
		enqueuedAt: Date.now(),
		startedAt: Date.now()
	});
	assert.deepEqual(intervals, [5000, 5000]);
	assert.equal(frames[0].keepAliveMs, 5000);
	assert.ok(ProgressInterval.milliseconds({ KEEPALIVE_MS: 25000 }) < 15000);
});

function captureIntervals(t) {
	const original = global.setInterval;
	const intervals = [];
	global.setInterval = (callback, milliseconds) => {
		intervals.push(milliseconds);
		return { unref() {} };
	};
	t.after(() => { global.setInterval = original; });
	return intervals;
}

function fixtures(frames) {
	return {
		Limits: { KEEPALIVE_MS: 25000, LANE_TIMEOUT_MS: {} },
		Correlation: { fields: () => ({}) },
		Send: { safeSend: (socket, frame) => frames.push(frame) },
		executionStages: { begin() {}, mark() {} },
		requestPayload: data => data.payload,
		retryControl: { progress() {} },
		state: { lanes: { p1_fs_light: { queue: [] } } },
		stats: () => ({}),
		streamEvent() {}
	};
}
