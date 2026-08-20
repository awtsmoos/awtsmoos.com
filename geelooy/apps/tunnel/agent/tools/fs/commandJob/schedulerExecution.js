// B"H
// Boruch Hashem
// Blessed is He

const Admission = require("./schedulerAdmission.js");
const Pump = require("./schedulerPump.js");
const QueueStartLease = require("./queueStartLease.js");
const Runner = require("./schedulerRunner.js");
const SchedulerState = require("./schedulerState.js");

const state = SchedulerState.state;

/**
 * @file Admits command jobs while bounding only their pre-launch queue custody.
 * @description
 * The Awtsmoos lets live processes keep their measured physical slot until true
 * terminal finalization, while Awtsmoos.com expires only commands that never reached launch.
 */
async function submit(record = {}) {
	if (!record.jobId || typeof record.launch !== "function") {
		return { ok: false, error: "invalid_command_schedule_record" };
	}
	const ownerFailure = Admission.ownerLimit(record);
	if (ownerFailure) {
		state.rejected += 1;
		return ownerFailure;
	}
	if (Admission.canLaunchImmediately()) {
		state.active.set(record.jobId, record.ownerId);
		return {
			ok: true,
			queued: false,
			result: await Runner.launch(record, finish)
		};
	}
	const queued = state.queue.enqueue(record.ownerId, record);
	if (!queued.ok) {
		state.rejected += 1;
		return queued;
	}
	const lease = QueueStartLease.arm(record, expireQueued, {
		timeoutMs: record.queueStartTimeoutMs
	});
	return {
		ok: true,
		queued: true,
		queuePosition: state.queue.snapshot().queued,
		queueStartDeadlineAt: lease.deadlineAt,
		queueStartTimeoutMs: lease.timeoutMs,
		owner: queued.owner,
		ownerQueued: queued.ownerQueued
	};
}

function finish(jobId) {
	const released = state.active.delete(String(jobId || ""));
	queueMicrotask(() => { void Pump.pump(finish); });
	return released;
}

function cancelQueued(jobId) {
	const removed = state.queue.remove(record => record.jobId === String(jobId || ""));
	QueueStartLease.clear(removed);
	return removed;
}

async function expireQueued(record, waitedMs) {
	const removed = state.queue.remove(item => item === record || item.jobId === record.jobId);
	if (!removed) return false;
	QueueStartLease.clear(removed);
	state.expired += 1;
	const error = QueueStartLease.expiryError(removed, waitedMs);
	try {
		await removed.onLaunchError?.(error);
	} finally {
		queueMicrotask(() => { void Pump.pump(finish); });
	}
	return true;
}

function pump() {
	return Pump.pump(finish);
}

module.exports = {
	cancelQueued,
	expireQueued,
	finish,
	pump,
	submit
};
