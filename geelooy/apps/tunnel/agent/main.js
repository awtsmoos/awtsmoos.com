#!/usr/bin/env node
// B"H
const D = require('./lib/runtime/main-dependencies.js');
const { createMainComponents } = require('./lib/runtime/main-components.js');

let components;

function nextLane() {
	return components.queue.nextLane();
}

function scheduleDrain() {
	if (components.runtime.state.drainScheduled) return;
	if (!nextLane()) return;
	components.runtime.state.drainScheduled = true;
	setImmediate(drainQueue);
}

function drainQueue() {
	components.runtime.state.drainScheduled = false;
	const lane = nextLane();
	if (!lane) return;
	const item = components.runtime.state.lanes[lane].queue.shift();
	components.queue.clearQueueKeepalive(item);
	if (item?.ws?.opened) {
		components.runRequest(lane, item.ws, item.data, item.enqueuedAt).catch(error => {
			components.log('warn', `runRequest failed: ${error.message}`);
		});
	}
	if (nextLane()) scheduleDrain();
}

function release(lane) {
	const laneState = components.runtime.state.lanes[lane];
	if (laneState) laneState.inflight = Math.max(0, laneState.inflight - 1);
	scheduleDrain();
}

components = createMainComponents(D, { release, scheduleDrain });

const memoryTimer = setInterval(() => {
	components.log('info', `Memory: ${JSON.stringify(components.runtime.snapshot())}`);
}, 60000);
memoryTimer.unref?.();
components.runtime.lagMonitor.start();

process.on('SIGINT', () => {
	components.workers.stopAll('SIGTERM');
	process.exit(0);
});
process.on('SIGTERM', () => {
	components.workers.stopAll('SIGTERM');
	process.exit(0);
});

if (require.main === module) {
	components.startup.main().catch(error => {
		components.log('error', error.stack || error.message);
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
