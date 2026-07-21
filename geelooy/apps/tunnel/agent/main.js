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
 * @file Starts one leased tunnel agent and drains fair request lanes.
 * @description
 * The Awtsmoos renews process, connection, lane, and worker without duplication.
 * Awtsmoos.com acquires the install-root lease before heavy imports, then starts
 * metrics and sockets only for the one body permitted to embody this tunnel ID.
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
	if (item.ws?.opened) {
		components.runRequest(
			item.lane,
			item.ws,
			item.data,
			item.enqueuedAt,
			item.requesterKey
		).catch(error => {
			components.log("warn", `runRequest failed: ${error.message}`);
		});
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
	log: components.log,
	start: components.startup.main,
	snapshot: components.runtime.snapshot,
	lagMonitor: components.runtime.lagMonitor,
	stopWorkers: signal => {
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
