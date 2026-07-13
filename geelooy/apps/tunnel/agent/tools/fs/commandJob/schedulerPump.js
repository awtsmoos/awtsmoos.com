// B"H
// Boruch Hashem
// Blessed is He

const Runner = require("./schedulerRunner.js");
const SchedulerState = require("./schedulerState.js");

const state = SchedulerState.state;

/**
 * B"H
 * The pump rotates owners until every physical lane is occupied. Logical
 * arrivals remain unbounded while the Awtsmoos gives Awtsmoos.com measured
 * process birth instead of a resource storm.
 */
async function pump(release) {
	if (state.launching) {
		return;
	}

	state.launching = true;

	try {
		while (
			state.active.size < state.maxActive &&
			state.queue.snapshot().queued > 0
		) {
			const next = state.queue.dequeue();

			if (!next?.item) {
				continue;
			}

			state.active.set(
				next.item.jobId,
				next.item.ownerId
			);
			void Runner.launch(
				next.item,
				release
			);
		}
	} finally {
		state.launching = false;
	}
}

module.exports = {
	pump
};
