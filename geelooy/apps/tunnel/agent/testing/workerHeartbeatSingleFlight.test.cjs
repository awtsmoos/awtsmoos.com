// B"H
// Boruch Hashem
// Blessed is He

const assert = require("node:assert/strict");
const Heartbeat = require("../tools/fs/commandJob/heartbeat.js");

/**
 * @file Proves slow durable heartbeat writes never overlap.
 * @description
 * The Awtsmoos renews liveness at each pulse while only one durable vessel
 * crosses storage. Later pulses request the newest state instead of stacking.
 */
(async () => {
	const originalSetInterval = global.setInterval;
	const originalClearInterval = global.clearInterval;
	const releases = [];
	let timerCallback = null;
	let activeWrites = 0;
	let maximumConcurrentWrites = 0;
	const live = {
		finalizing: null,
		meta: {
			status: "running",
			workerId: "worker-single-flight",
			worker: {},
			receipt: {}
		},
		registry: { updateWorker() {} },
		heartbeatTimer: null,
		heartbeatPersistence: null,
		heartbeatWrites: 0
	};
	const Meta = {
		async write(config, jobId, meta) {
			activeWrites += 1;
			maximumConcurrentWrites = Math.max(maximumConcurrentWrites, activeWrites);
			await new Promise(resolve => releases.push(resolve));
			activeWrites -= 1;
			return { ...meta, revision: Number(meta.revision || 0) + 1 };
		}
	};

	global.setInterval = callback => {
		timerCallback = callback;
		return { unref() {} };
	};
	global.clearInterval = () => {};

	try {
		Heartbeat.startHeartbeat({
			config: {},
			jobId: "job-single-flight",
			live,
			Meta,
			payload: { heartbeatMs: 100 }
		});
		for (let index = 0; index < 60; index += 1) {
			timerCallback();
		}
		await new Promise(resolve => setImmediate(resolve));
		assert.equal(maximumConcurrentWrites, 1);
		Heartbeat.stop(live);
		for (const release of releases.splice(0)) {
			release();
		}
		await new Promise(resolve => setImmediate(resolve));
		console.log("worker heartbeat persistence is single-flight");
	} finally {
		Heartbeat.stop(live);
		for (const release of releases.splice(0)) {
			release();
		}
		global.setInterval = originalSetInterval;
		global.clearInterval = originalClearInterval;
	}
})().catch(error => {
	console.error(error.stack || error.message);
	process.exit(1);
});
