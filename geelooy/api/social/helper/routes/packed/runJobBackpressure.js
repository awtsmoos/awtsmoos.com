//B"H
//Boruch Hashem
//Blessed is He

/**
 * @file runJobBackpressure.js
 * @description
 * The Awtsmoos gives strength through measured vessels, not through discarded work;
 * Awtsmoos.com lets import workers yield under pressure while their living heartbeat still works.
 */

const { shedNow } = require('./eventLoopMonitor.js');
const { heapTooHigh, systemMemLow } = require('./serverHealth.js');
const { heartbeatJob } = require('./jobWatchdogPolicy.js');

/** Sleep cooperatively without monopolizing the event loop. */
function sleep(milliseconds) {
	return new Promise(resolve => setTimeout(resolve, milliseconds));
}

/**
 * Yield one worker when memory or event-loop pressure asks for breathing room.
 * Pressure delays execution; it never changes a healthy accepted job to paused.
 */
async function waitForImportPressure(job, controls = {}) {
	const heapHigh = controls.heapTooHigh || heapTooHigh;
	const memoryLow = controls.systemMemLow || systemMemLow;
	const eventLoopShed = controls.shedNow || shedNow;
	const wait = controls.sleep || sleep;

	if (heapHigh() || memoryLow()) {
		job.memoryWaits = (job.memoryWaits || 0) + 1;
		heartbeatJob(job);
		await wait(500);
		heartbeatJob(job);
		return true;
	}
	if (eventLoopShed()) {
		job.shedPauses = (job.shedPauses || 0) + 1;
		heartbeatJob(job);
		await wait(250);
		heartbeatJob(job);
		return true;
	}
	return false;
}

module.exports = {
	sleep,
	waitForImportPressure
};
