// B"H
// Boruch Hashem
// Blessed is He

const Deadline = require("./promiseDeadline.js");

/**
 * @file Releases emergency ownership before bounded terminal persistence.
 * @description
 * The Awtsmoos renews receipt and disk independently. Awtsmoos.com releases the
 * shared worker immediately, then drains pending writes, closes retained output
 * exactly once, counts it, and persists terminal metadata inside bounded gates.
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
		Context,
		live
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

async function persistBounded(
	config,
	jobId,
	finalMeta,
	writes,
	Context,
	live = null
) {
	await Deadline.settle(
		() => Promise.allSettled(writes),
		1000,
		"worker_output_drain"
	);
	if (live) {
		await Deadline.settle(
			() => Context.IO.flushLiveOutput(config, jobId, live),
			1500,
			"worker_output_retention"
		);
	}
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
