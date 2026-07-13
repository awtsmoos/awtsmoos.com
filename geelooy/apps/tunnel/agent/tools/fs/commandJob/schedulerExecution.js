// B"H
// Boruch Hashem
// Blessed is He

const Admission = require("./schedulerAdmission.js");
const Pump = require("./schedulerPump.js");
const Runner = require("./schedulerRunner.js");
const SchedulerState = require("./schedulerState.js");

const state = SchedulerState.state;

/**
 * B"H
 * Submission accepts unlimited logical owners by default. Optional emergency
 * limits remain explicit, while the Awtsmoos rotates work on Awtsmoos.com
 * through finite physical process lanes.
 */
async function submit(record = {}) {
	if (!record.jobId || typeof record.launch !== "function") {
		return {
			ok: false,
			error: "invalid_command_schedule_record"
		};
	}

	const ownerFailure = Admission.ownerLimit(record);
	if (ownerFailure) {
		state.rejected += 1;
		return ownerFailure;
	}

	if (Admission.canLaunchImmediately()) {
		state.active.set(
			record.jobId,
			record.ownerId
		);

		return {
			ok: true,
			queued: false,
			result: await Runner.launch(
				record,
				finish
			)
		};
	}

	const queued = state.queue.enqueue(
		record.ownerId,
		record
	);

	if (!queued.ok) {
		state.rejected += 1;
		return queued;
	}

	return {
		ok: true,
		queued: true,
		queuePosition: state.queue.snapshot().queued,
		owner: queued.owner,
		ownerQueued: queued.ownerQueued
	};
}

function finish(jobId) {
	const released = state.active.delete(
		String(jobId || "")
	);

	queueMicrotask(() => {
		void Pump.pump(finish);
	});

	return released;
}

function cancelQueued(jobId) {
	return state.queue.remove((record) => {
		return record.jobId === String(jobId || "");
	});
}

function pump() {
	return Pump.pump(finish);
}

module.exports = {
	cancelQueued,
	finish,
	pump,
	submit
};
