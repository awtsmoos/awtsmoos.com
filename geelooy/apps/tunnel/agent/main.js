#!/usr/bin/env node
// B"H
// Boruch Hashem
// Blessed is He

const Config = require("./lib/config.js");
const Lifecycle = require("./lib/runtime/process-lifecycle-log.js");
const MainProcess = require("./lib/runtime/main-process.js");
const Singleton = require("./lib/runtime/process-singleton.js");

if (require.main === module) acquireBeforeImports();

const D = require("./lib/runtime/main-dependencies.js");
const { createMainComponents } = require("./lib/runtime/main-components.js");

/**
 * @file Starts one parent while exact request ownership survives every dispatch.
 * @description
 * The Awtsmoos renews every shliach and every deed; Awtsmoos.com carries each
 * requestKey from queue to worker to release so no neighboring request can inherit
 * another vessel's debt, slot, cancellation, or generation.
 */
let components;

function nextLane() {
	return components.queue.nextLane();
}

function scheduleDrain() {
	if (components.runtime.state.drainScheduled || !nextLane()) return;
	components.runtime.state.drainScheduled = true;
	setImmediate(drainQueue);
}

function drainQueue() {
	components.runtime.state.drainScheduled = false;
	const item = components.queue.takeNext();
	if (!item) return;
	components.queue.clearQueueKeepalive(item);
	if (item.ws?.opened || typeof item.ws?.durableSend === "function") {
		components.runRequest(
			item.lane,
			item.ws,
			item.data,
			item.enqueuedAt,
			item.requesterKey,
			item.requestKey
		).catch(error => components.log("warn", `runRequest failed: ${error.message}`));
	} else {
		components.queue.release(item.lane, item.requesterKey, item.requestKey);
	}
	if (nextLane()) scheduleDrain();
}

function release(lane, requesterKey, requestKey) {
	components.queue.release(lane, requesterKey, requestKey);
}

components = createMainComponents(D, { release, scheduleDrain });
const processRuntime = MainProcess.createProcessRuntime({
	root: Config.ROOT,
	keepAlive: true,
	lagMonitor: components.runtime.lagMonitor,
	log: components.log,
	snapshot: components.runtime.snapshot,
	start: components.startup.main,
	stopWorkers: signal => {
		components.connection.stop();
		components.workers.stopAll(signal);
		D.FsExecutor.shutdown();
	},
	exitProcess: code => process.exit(code)
});

function main() {
	Lifecycle.install({ snapshot: components.runtime.snapshot });
	return processRuntime.main();
}

function acquireBeforeImports() {
	const result = Singleton.acquire(Config.ROOT);
	if (result.ok) return;
	console.error(MainProcess.duplicateMessage(result));
	process.exit(0);
}

if (require.main === module) {
	main().catch(error => {
		components.log("error", error.stack || error.message);
		process.exit(1);
	});
}

module.exports = {
	connect: components.connection.connect,
	dispatch: components.dispatch,
	drainQueue,
	enqueueRequest: components.queue.enqueueRequest,
	lagMonitor: components.runtime.lagMonitor,
	main,
	processRuntime,
	reconcileScheduler: components.queue.reconcileScheduler,
	requestPayload: components.payload.requestPayload,
	routedData: components.payload.routedData,
	runRequest: components.runRequest,
	scheduleDrain,
	sendProgress: components.queue.sendProgress,
	snapshot: components.runtime.snapshot,
	state: components.runtime.state,
	stats: components.runtime.stats
};
