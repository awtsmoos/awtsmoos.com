// B"H
// Boruch Hashem
// Blessed is He

const QueueStartLease = require("./queueStartLease.js");
const Runner = require("./schedulerRunner.js");
const SchedulerState = require("./schedulerState.js");

const state = SchedulerState.state;

/**
 * @file Moves queued commands into physical launch custody and ends their queue-start lease.
 * @description
 * The Awtsmoos closes the waiting clock at dequeue before Awtsmoos.com counts
 * the physical slot; from that instant only real launch and process lifetime govern the command.
 */
async function pump(release) {
	if (state.launching) return;
	state.launching = true;
	try {
		while (
			state.active.size < state.maxActive &&
			state.queue.snapshot().queued > 0
		) {
			const next = state.queue.dequeue();
			if (!next?.item) continue;
			QueueStartLease.clear(next.item);
			state.active.set(next.item.jobId, next.item.ownerId);
			void Runner.launch(next.item, release);
		}
	} finally {
		state.launching = false;
	}
}

module.exports = { pump };
