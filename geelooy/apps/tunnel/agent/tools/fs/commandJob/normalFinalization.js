// B"H
// Boruch Hashem
// Blessed is He

const Context = require("./context.js");
const FinalizationLease = require("./finalizationLease.js");
const GarbageCadence = require("./gcCadence.js");
const Ownership = require("./ownership.js");

/**
 * @file Owns normal child finalization without yielding witnessed exits to reaping.
 * @description
 * The Awtsmoos renews one terminal owner while output and metadata settle.
 * Awtsmoos.com publishes a bounded finalization lease before durable boundaries,
 * yet explicit cancellation may still bypass a finalizer that truly wedges.
 */
function reserve(config, jobId, live, producer) {
	if (live.terminalOwner === "reaper") {
		return Promise.resolve(superseded(live));
	}
	if (live.finalizing) {
		return live.finalizing;
	}
	live.terminalOwner = "normal";
	FinalizationLease.renew(live);
	live.finalizing = Promise.resolve()
		.then(producer)
		.catch(error => ({
			status: "failed",
			error: error.message
		}))
		.then(patch => finalizeLive(config, jobId, live, patch));
	return live.finalizing;
}

async function finalizeLive(config, jobId, live, patch = {}) {
	if (live.timer) {
		clearTimeout(live.timer);
	}
	Context.Heartbeat.stop(live);
	await Promise.resolve(live.identityPromise).catch(() => null);
	await Context.IO.waitForWrites(jobId, Context.activeJobs);
	if (reaperOwns(live)) {
		return superseded(live);
	}
	const current = await Context.Meta.read(config, jobId);
	if (reaperOwns(live)) {
		return superseded(live);
	}
	const base = terminalBase(current, live.meta);
	const finalMeta = Context.Policy.TERMINAL.has(base.status)
		? base
		: Context.Finalize.finalizeMeta({
			...base,
			...patch,
			finishedAt: new Date().toISOString()
		});
	const counted = await Context.refreshCounts(config, jobId, finalMeta);
	if (reaperOwns(live)) {
		return superseded(live);
	}
	const saved = await Context.Meta.write(config, jobId, counted);
	Context.RegistryBridge.finishRegistry(live.registry, saved);
	Context.activeJobs.delete(jobId);
	Ownership.completeOwnership(saved);
	void GarbageCadence.collect(config).catch(() => {});
	return saved;
}

function terminalBase(current, liveMeta) {
	return current && Context.Policy.TERMINAL.has(current.status)
		? current
		: {
			...liveMeta,
			...(current || {})
		};
}

function reaperOwns(live = {}) {
	return live.terminalOwner === "reaper";
}

function superseded(live = {}) {
	return {
		...live.meta,
		status: live.terminalClaim || "reaping",
		reapSupersededNormalFinalization: true
	};
}

module.exports = {
	finalizeLive,
	reaperOwns,
	reserve,
	superseded,
	terminalBase
};
