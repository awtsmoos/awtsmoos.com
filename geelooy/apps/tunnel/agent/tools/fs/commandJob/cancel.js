// B"H
// Boruch Hashem
// Blessed is He

const Context = require("./context.js");
const Response = require("./cancelResponse.js");
const Stored = require("./cancelStored.js");

/**
 * B"H
 *
 * Live cancellation enters the independent reaper, never a worker's existing
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
	return Response.terminalCancel(payload, jobId, meta, {
		cancelled: meta.status === "cancelled",
		detachedRecovered: false,
		reaperClaimed: result.claimed,
		reaperTimedOut: result.outcome?.timedOut === true
	});
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
	terminalCancel: Response.terminalCancel
};
