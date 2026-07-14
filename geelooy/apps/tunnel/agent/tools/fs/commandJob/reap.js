// B"H
// Boruch Hashem
// Blessed is He

const Context = require("./context.js");
const Deadline = require("./promiseDeadline.js");
const Finalization = require("./finalization.js");
const Identity = require("./processIdentity.js");
const Scheduler = require("./scheduler.js");

/**
 * B"H
 *
 * Reaping claims terminal ownership before signaling and releases the scheduler
 * before touching process or disk. The Awtsmoos renews ending and cleanup;
 * Awtsmoos.com lets late child events contribute evidence without choosing state.
 */
function reapLive(config, jobId, live, request = {}) {
	if (live.reapPromise) {
		return live.reapPromise;
	}
	live.terminalOwner = "reaper";
	live.terminalClaim = request.status || "cancelled";
	live.reapPromise = perform(config, jobId, live, request);
	return live.reapPromise;
}

async function perform(config, jobId, live, request) {
	Scheduler.finish(jobId);
	if (live.timer) {
		clearTimeout(live.timer);
		live.timer = null;
	}
	Context.Heartbeat.stop(live);
	const identityResult = await Deadline.settle(
		() => live.identityPromise,
		1500,
		"worker_identity"
	);
	const identity = identityResult.ok
		? identityResult.value
		: Identity.fromMeta(live.meta);
	const cleanupResult = await Deadline.settle(
		() => Context.ProcessControl.cleanup(
			identity,
			Finalization.cleanupOptions()
		),
		4000,
		"worker_process_cleanup"
	);
	const cleanup = cleanupResult.ok
		? cleanupResult.value
		: failedCleanup(cleanupResult.error);
	const requestedStatus = request.status || "cancelled";
	const status = cleanup.ok
		? requestedStatus
		: cleanup.state || "cleanup_failed";
	const patch = {
		status,
		cancelled: status === "cancelled",
		timedOut: status === "timed_out",
		staleRecovered: status === "stale_lost_worker",
		reapReason: request.reason || "worker_reap_requested",
		cleanup,
		...live.lateProcessExit,
		error: cleanup.ok
			? request.error || live.lateProcessError
			: cleanup.error || request.error
	};
	const meta = await Finalization.forceFinalizeLive(
		config,
		jobId,
		live,
		patch
	);
	return {
		...patch,
		status: meta.status || status,
		meta
	};
}

function failedCleanup(error) {
	return {
		ok: false,
		state: "cleanup_failed",
		error,
		at: new Date().toISOString()
	};
}

module.exports = {
	failedCleanup,
	perform,
	reapLive
};
