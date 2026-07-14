// B"H
// Boruch Hashem
// Blessed is He

const Deadline = require("./promiseDeadline.js");

/**
 * B"H
 *
 * Emergency finalization releases ownership before storage. The Awtsmoos renews
 * receipt and disk independently; Awtsmoos.com records terminal in-memory truth
 * immediately while bounded persistence may finish without holding another agent.
 */
async function forceFinalizeLive(args = {}) {
	const {
		config,
		jobId,
		live,
		patch,
		Context,
		completeOwnership,
		GarbageCadence
	} = args;
	const pendingWrites = [...(live.writes || [])];
	clearRuntimeTimers(Context, live);
	Context.activeJobs.delete(jobId);
	completeOwnership({
		...live.meta,
		...patch,
		jobId
	});
	const finalMeta = Context.Finalize.finalizeMeta({
		...live.meta,
		...patch,
		jobId,
		finishedAt: patch.finishedAt || new Date().toISOString()
	});
	Context.RegistryBridge.finishRegistry(live.registry, finalMeta);
	const durable = await persistBounded(
		config,
		jobId,
		finalMeta,
		pendingWrites,
		Context
	);
	const result = durable.ok
		? durable.value
		: {
			...finalMeta,
			durableFinalizationPending: true,
			durableFinalizationError: durable.error
		};
	Context.RegistryBridge.finishRegistry(live.registry, result);
	void GarbageCadence.collect(config).catch(() => {});
	return result;
}

function clearRuntimeTimers(Context, live) {
	if (live.timer) {
		clearTimeout(live.timer);
		live.timer = null;
	}
	Context.Heartbeat.stop(live);
}

async function persistBounded(config, jobId, finalMeta, writes, Context) {
	await Deadline.settle(
		() => Promise.allSettled(writes),
		1000,
		"worker_output_drain"
	);
	const counted = await Deadline.settle(
		() => Context.refreshCounts(config, jobId, finalMeta),
		1500,
		"worker_output_count"
	);
	const value = counted.ok
		? counted.value
		: finalMeta;
	return Deadline.settle(
		() => Context.Meta.write(config, jobId, value),
		2500,
		"worker_terminal_write"
	);
}

module.exports = {
	clearRuntimeTimers,
	forceFinalizeLive,
	persistBounded
};
