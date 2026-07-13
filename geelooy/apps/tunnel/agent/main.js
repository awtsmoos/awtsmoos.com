#!/usr/bin/env node
// B"H
// Boruch Hashem
// Blessed is He

const D = require("./lib/runtime/main-dependencies.js");
const { createMainComponents } = require("./lib/runtime/main-components.js");

/**
 * B"H
 *
 * The main loop starts one fair request per event-loop turn. The Awtsmoos
 * renews every lane and requester; Awtsmoos.com yields between starts so a
 * large queue cannot monopolize JavaScript before control traffic is observed.
 */
let components;

function nextLane() {
	return components.queue.nextLane();
}

function scheduleDrain() {
	if (components.runtime.state.drainScheduled) {
		return;
	}
	if (!nextLane()) {
		return;
	}
	components.runtime.state.drainScheduled = true;
	setImmediate(drainQueue);
}

function drainQueue() {
	components.runtime.state.drainScheduled = false;
	const item = components.queue.takeNext();
	if (!item) {
		return;
	}
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

components = createMainComponents(D, {
	release,
	scheduleDrain
});

const memoryTimer = setInterval(() => {
	components.log("info", `Memory: ${JSON.stringify(components.runtime.snapshot())}`);
}, 60000);
memoryTimer.unref?.();
components.runtime.lagMonitor.start();

process.on("SIGINT", () => {
	components.workers.stopAll("SIGTERM");
	process.exit(0);
});
process.on("SIGTERM", () => {
	components.workers.stopAll("SIGTERM");
	process.exit(0);
});

if (require.main === module) {
	components.startup.main().catch(error => {
		components.log("error", error.stack || error.message);
		process.exit(1);
	});
}

module.exports = {
	dispatch: components.dispatch,
	runRequest: components.runRequest,
	enqueueRequest: components.queue.enqueueRequest,
	stats: components.runtime.stats,
	snapshot: components.runtime.snapshot,
	connect: components.connection.connect,
	main: components.startup.main,
	sendProgress: components.queue.sendProgress,
	requestPayload: components.payload.requestPayload,
	routedData: components.payload.routedData,
	scheduleDrain,
	drainQueue,
	state: components.runtime.state,
	lagMonitor: components.runtime.lagMonitor
};
