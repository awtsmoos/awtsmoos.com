// B"H
// Boruch Hashem
// Blessed is He

const Context = require("./context.js");
const Deadline = require("./promiseDeadline.js");
const Identity = require("./processIdentity.js");
const Lifecycle = require("./lifecycle.js");
const Scheduler = require("./scheduler.js");

/**
 * B"H
 *
 * Cancellation enters the independent reaper, never a worker's existing
 * finalization promise. The Awtsmoos renews control and execution separately;
 * Awtsmoos.com releases active capacity before cleanup or durable writes await.
 */
async function cancelCommandJob(config = {}, payload = {}) {
	const jobId = Context.Policy.cleanId(
		payload.jobId ||
		payload.id ||
		""
	);
	if (!jobId) {
		return Context.named(payload, "commandCancel", {
			ok: false,
			error: "missing_jobId"
		});
	}
	const live = Context.activeJobs.get(jobId);
	return live
		? cancelLive(config, payload, jobId, live)
		: cancelStored(config, payload, jobId);
}

async function cancelLive(config, payload, jobId, live) {
	const result = await live.reaper.reapWorker(live.meta.workerId, {
		reason: "command_cancel_requested",
		status: "cancelled"
	});
	const meta = result.outcome?.result?.meta ||
		await boundedMeta(config, jobId) ||
		{
			...live.meta,
			status: result.record?.state || "cancelled",
			cleanup: result.record?.cleanup,
			finishedAt: result.record?.finishedAt
		};
	return terminalCancel(payload, jobId, meta, {
		cancelled: meta.status === "cancelled",
		detachedRecovered: false,
		reaperClaimed: result.claimed,
		reaperTimedOut: result.outcome?.timedOut === true
	});
}

async function cancelStored(config, payload, jobId) {
	let meta = await Context.Meta.read(config, jobId);
	if (!meta) {
		return Context.named(payload, "commandCancel", {
			ok: true,
			jobId,
			cancelled: false,
			status: "missing"
		});
	}
	if (Context.Policy.TERMINAL.has(meta.status)) {
		return terminalCancel(payload, jobId, meta, {
			cancelled: meta.status === "cancelled",
			alreadyTerminal: true
		});
	}
	if (meta.status === "queued") {
		return cancelQueued(config, payload, jobId, meta);
	}
	const cleanupResult = await Deadline.settle(
		() => Context.ProcessControl.cleanup(
			Identity.fromMeta(meta),
			Lifecycle.cleanupOptions()
		),
		4000,
		"stored_worker_cleanup"
	);
	const cleanup = cleanupResult.ok
		? cleanupResult.value
		: {
			ok: false,
			state: "cleanup_failed",
			error: cleanupResult.error
		};
	meta = await Lifecycle.finalizeDetached(config, jobId, meta, {
		status: cleanup.ok ? "cancelled" : cleanup.state,
		cancelled: cleanup.ok,
		detachedRecovered: true,
		cleanup
	});
	return terminalCancel(payload, jobId, meta, {
		cancelled: meta.status === "cancelled",
		detachedRecovered: true
	});
}

async function cancelQueued(config, payload, jobId, meta) {
	Scheduler.cancelQueued(jobId);
	const cleanup = {
		ok: true,
		state: "not_started",
		signals: [],
		at: new Date().toISOString()
	};
	const finalMeta = await Lifecycle.finalizeDetached(config, jobId, meta, {
		status: "cancelled",
		cancelled: true,
		cleanup
	});
	return terminalCancel(payload, jobId, finalMeta, {
		cancelled: true,
		queued: true
	});
}

async function boundedMeta(config, jobId) {
	const outcome = await Deadline.settle(
		() => Context.Meta.read(config, jobId),
		1000,
		"cancel_status_read"
	);
	return outcome.ok
		? outcome.value
		: null;
}

function terminalCancel(payload, jobId, meta, extra = {}) {
	const response = Context.Responses.status(jobId, meta, {
		...payload,
		action: "commandCancel",
		requestAction: payload.requestAction || payload.action || "commandCancel",
		actualAction: "commandCancel"
	});
	return Context.named(payload, "commandCancel", {
		...response,
		...extra,
		jobId,
		status: meta.status
	});
}

module.exports = {
	boundedMeta,
	cancelCommandJob,
	cancelLive,
	cancelQueued,
	cancelStored,
	terminalCancel
};
