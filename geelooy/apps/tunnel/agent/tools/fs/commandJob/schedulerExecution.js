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
 * @file Admits command jobs without making commandStart await launcher bookkeeping.
 * @description
 * The Awtsmoos gives the request one quick doorway and the subprocess another living
 * road. Awtsmoos.com reserves fair ownership immediately, returns durable custody,
 * and lets physical launch continue on a microtask so heavy birth cannot block the
 * native consumer that must remain free to carry diagnosis, receipts, and repair.
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
	if (Admission.canLaunchImmediately(record)) {
		return beginImmediate(record);
	}
	return enqueue(record);
}

/** Reserves the active slot and launches outside the caller's acceptance-critical stack. */
function beginImmediate(record) {
	state.active.set(record.jobId, record.ownerId);
	queueMicrotask(() => {
		void Runner.launch(record, finish);
	});
	return {
		ok: true,
		queued: false,
		starting: true,
		ownerId: record.ownerId
	};
}

/** Places one command into the fair owner queue with a bounded start lease. */
function enqueue(record) {
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
		starting: false,
		queuePosition: state.queue.snapshot().queued,
		queueStartDeadlineAt: lease.deadlineAt,
		queueStartTimeoutMs: lease.timeoutMs,
		owner: queued.owner,
		ownerQueued: queued.ownerQueued
	};
}

/** Releases one active slot and wakes the next fair queued owner. */
function finish(jobId) {
	const released = state.active.delete(String(jobId || ""));
	queueMicrotask(() => {
		void Pump.pump(finish);
	});
	return released;
}

/** Removes a queued command without affecting an already active process. */
function cancelQueued(jobId) {
	const removed = state.queue.remove(
		record => record.jobId === String(jobId || "")
	);
	QueueStartLease.clear(removed);
	return removed;
}

/** Finalizes a command that never received a physical start slot. */
async function expireQueued(record, waitedMs) {
	const removed = state.queue.remove(
		item => item === record || item.jobId === record.jobId
	);
	if (!removed) return false;
	QueueStartLease.clear(removed);
	state.expired += 1;
	const error = QueueStartLease.expiryError(removed, waitedMs);
	try {
		await removed.onLaunchError?.(error);
	} finally {
		queueMicrotask(() => {
			void Pump.pump(finish);
		});
	}
	return true;
}

/** Invokes one fair-queue pump cycle for diagnostics and tests. */
function pump() {
	return Pump.pump(finish);
}

module.exports = {
	beginImmediate,
	cancelQueued,
	enqueue,
	expireQueued,
	finish,
	pump,
	submit
};
