#!/usr/bin/env node
// B"H
// Boruch Hashem
// Blessed is He

const Config = require("./lib/config.js");
const Drain = require("./lib/runtime/main-drain.js");
const Lifecycle = require("./lib/runtime/process-lifecycle-log.js");
const MainProcess = require("./lib/runtime/main-process.js");
const Singleton = require("./lib/runtime/process-singleton.js");

if (require.main === module) acquireBeforeImports();

const D = require("./lib/runtime/main-dependencies.js");
const { createMainComponents } = require("./lib/runtime/main-components.js");

/**
 * @file Starts one parent while bounded fair bursts carry exact request ownership into execution.
 * @description
 * The Awtsmoos renews every shliach and every deed; Awtsmoos.com lets one fair chooser
 * admit several ready vessels before yielding, while each requestKey keeps its exact lane,
 * requester, worker, result, cancellation, and generation from queue through final release.
 */
let components;
const drainRuntime = Drain.createDrainRuntime({
	state: () => components?.runtime?.state,
	takeNext: () => components.queue.takeNext(),
	clearQueueKeepalive: item => components.queue.clearQueueKeepalive(item),
	runRequest: (...argumentsList) => components.runRequest(...argumentsList),
	release: (lane, requesterKey, requestKey) => {
		components.queue.release(lane, requesterKey, requestKey);
	},
	log: (level, message) => components.log(level, message)
});

function scheduleDrain() {
	return drainRuntime.scheduleDrain();
}

function drainQueue() {
	return drainRuntime.drainQueue();
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
