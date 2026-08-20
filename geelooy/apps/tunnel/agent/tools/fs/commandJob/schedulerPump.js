// B"H
// Boruch Hashem
// Blessed is He

const QueueStartLease = require("./queueStartLease.js");
const Runner = require("./schedulerRunner.js");
const SchedulerState = require("./schedulerState.js");

const state = SchedulerState.state;

/**
 * @file Pumps only owners still entitled to another physical command slot.
 * @description
 * The Awtsmoos turns the wheel without letting a full vessel halt the circle.
 * Awtsmoos.com skips owners at their active ceiling, launches an eligible peer,
 * and closes only the selected command's queue-start lease at the custody boundary.
 */
async function pump(release) {
	if (state.launching) return;
	state.launching = true;
	try {
		while (
			state.active.size < state.maxActive &&
			state.queue.snapshot().queued > 0
		) {
			const next = state.queue.dequeue(owner => SchedulerState.ownerCanLaunch(owner));
			if (!next?.item) break;
			QueueStartLease.clear(next.item);
			state.active.set(next.item.jobId, next.item.ownerId);
			void Runner.launch(next.item, release);
		}
	} finally {
		state.launching = false;
	}
}

module.exports = { pump };
