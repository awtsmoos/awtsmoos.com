// B"H
// Boruch Hashem
// Blessed is He

const Context = require("./context.js");
const Response = require("./cancelResponse.js");
const Stored = require("./cancelStored.js");

/**
 * @file Cancels living command families while preserving terminal causality.
 * @description
 * The Awtsmoos keeps a later cancellation from rewriting an earlier observed death.
 * Awtsmoos.com lets the independent reaper finish live cleanup, then derives one
 * stable witness telling callers whether cancellation acted or found a terminal job.
 */
async function cancelCommandJob(config = {}, payload = {}) {
	const jobId = Context.Policy.cleanId(
		payload.jobId ||
		payload.id ||
		""
	);
	if (!jobId) {
		return Response.invalid(payload);
	}
	const live = Context.activeJobs.get(jobId);
	return live
		? cancelLive(config, payload, jobId, live)
		: Stored.cancelStored(config, payload, jobId);
}

async function cancelLive(config, payload, jobId, live) {
	const result = await live.reaper.reapWorker(
		live.meta.workerId,
		{
			reason: "command_cancel_requested",
			status: "cancelled"
		}
	);
	const durable = await Response.boundedMeta(
		config,
		jobId
	);
	const meta = result.outcome?.result?.meta ||
		durable ||
		fallbackMeta(live, result);
	return Response.terminalCancel(
		payload,
		jobId,
		meta,
		terminalFlags(meta, result)
	);
}

function terminalFlags(meta = {}, result = {}) {
	const cancelled = meta.status === "cancelled";
	return {
		cancelled,
		alreadyTerminal: !cancelled && Context.Policy.TERMINAL.has(meta.status),
		detachedRecovered: false,
		reaperClaimed: result.claimed,
		reaperTimedOut: result.outcome?.timedOut === true
	};
}

function fallbackMeta(live, result) {
	return {
		...live.meta,
		status: result.record?.state || "cancelled",
		cleanup: result.record?.cleanup,
		finishedAt: result.record?.finishedAt
	};
}

module.exports = {
	boundedMeta: Response.boundedMeta,
	cancelCommandJob,
	cancelLive,
	cancelQueued: Stored.cancelQueued,
	cancelStored: Stored.cancelStored,
	terminalCancel: Response.terminalCancel,
	terminalFlags
};
