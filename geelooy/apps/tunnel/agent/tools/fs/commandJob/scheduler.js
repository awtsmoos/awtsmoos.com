// B"H
const FairQueue = require('./fairQueue.js');

/**
 * B"H — Starts are bounded and fair. Control operations never pass through this
 * scheduler, so status, output, wait, and cancel remain available under pressure.
 */
const active = new Set();
const queue = FairQueue.create({
	maxQueued: positive(process.env.AWTSMOOS_COMMAND_MAX_QUEUED, 2048),
	maxPerOwner: positive(process.env.AWTSMOOS_COMMAND_MAX_QUEUED_PER_OWNER, 128)
});
const maxActive = positive(process.env.AWTSMOOS_COMMAND_MAX_ACTIVE, 32);
let launching = false;
let rejected = 0;

async function submit(record = {}) {
	if (!record.jobId || typeof record.launch !== 'function') {
		return { ok: false, error: 'invalid_command_schedule_record' };
	}
	if (active.size < maxActive && queue.snapshot().queued === 0) {
		active.add(record.jobId);
		return { ok: true, queued: false, result: await launch(record) };
	}
	const queued = queue.enqueue(record.ownerId, record);
	if (!queued.ok) {
		rejected += 1;
		return queued;
	}
	return {
		ok: true,
		queued: true,
		queuePosition: queue.snapshot().queued,
		owner: queued.owner,
		ownerQueued: queued.ownerQueued
	};
}

function finish(jobId) {
	const released = active.delete(String(jobId || ''));
	queueMicrotask(() => void pump());
	return released;
}

function cancelQueued(jobId) {
	return queue.remove(record => record.jobId === String(jobId || ''));
}

async function pump() {
	if (launching) return;
	launching = true;
	try {
		while (active.size < maxActive && queue.snapshot().queued > 0) {
			const next = queue.dequeue();
			if (!next?.item) continue;
			active.add(next.item.jobId);
			void launch(next.item);
		}
	} finally {
		launching = false;
	}
}

async function launch(record) {
	try {
		return await record.launch();
	} catch (error) {
		try { await record.onLaunchError?.(error); }
		finally { finish(record.jobId); }
		return { ok: false, error: error.message, jobId: record.jobId };
	}
}

function snapshot() {
	return {
		active: active.size,
		maxActive,
		available: Math.max(0, maxActive - active.size),
		rejected,
		...queue.snapshot()
	};
}

function ownerOf(payload = {}) {
	return String(
		payload.agentSessionId ||
		payload.logicalAgentId ||
		payload.missionId ||
		payload.clientRequestId ||
		payload.controlRequestId ||
		'anonymous'
	).trim() || 'anonymous';
}

function positive(value, fallback) {
	const number = Number(value);
	return Number.isFinite(number) && number > 0 ? Math.floor(number) : fallback;
}

module.exports = { cancelQueued, finish, ownerOf, pump, snapshot, submit };
