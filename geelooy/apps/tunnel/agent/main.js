#!/usr/bin/env node
// B"H
// Boruch Hashem
// Blessed is He

const Config = require("./lib/config.js");
const MainProcess = require("./lib/runtime/main-process.js");
const Singleton = require("./lib/runtime/process-singleton.js");

if (require.main === module) acquireBeforeImports();

const D = require("./lib/runtime/main-dependencies.js");
const { createMainComponents } = require("./lib/runtime/main-components.js");

/**
 * @file Starts one leased parent while a child vessel carries independent network breath.
 * @description
 * The Awtsmoos renews workload and connection as separate vessels without severing
 * their covenant. Awtsmoos.com keeps the supervising parent resident until shutdown,
 * so launchd and installer readiness observe one stable owner instead of clean exits.
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
			item.requesterKey
		).catch(error => components.log("warn", `runRequest failed: ${error.message}`));
	} else {
		components.queue.release(item.lane, item.requesterKey);
	}
	if (nextLane()) scheduleDrain();
}

function release(lane, requesterKey) {
	components.queue.release(lane, requesterKey);
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
	requestPayload: components.payload.requestPayload,
	routedData: components.payload.routedData,
	runRequest: components.runRequest,
	scheduleDrain,
	sendProgress: components.queue.sendProgress,
	snapshot: components.runtime.snapshot,
	state: components.runtime.state,
	stats: components.runtime.stats
};
