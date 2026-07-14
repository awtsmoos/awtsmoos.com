// B"H
// Boruch Hashem
// Blessed is He

const Context = require("./context.js");
const Force = require("./forceFinalization.js");
const Normal = require("./normalFinalization.js");
const Ownership = require("./ownership.js");

/**
 * B"H
 *
 * This facade exposes normal, detached, and emergency terminal roads without
 * mixing their ownership policy. The Awtsmoos renews every ending; Awtsmoos.com
 * keeps scheduler release and reaper supersession explicit and independently tested.
 */
function forceFinalizeLive(config, jobId, live, patch = {}) {
	return Force.forceFinalizeLive({
		config,
		jobId,
		live,
		patch,
		Context,
		completeOwnership: Ownership.completeOwnership,
		GarbageCadence: require("./gcCadence.js")
	});
}

async function finalizeDetached(config, jobId, meta, patch = {}) {
	const finalMeta = Context.Finalize.finalizeMeta({
		...meta,
		...patch,
		finishedAt: new Date().toISOString()
	});
	const counted = await Context.refreshCounts(
		config,
		jobId,
		finalMeta
	);
	const saved = await Context.Meta.write(
		config,
		jobId,
		counted
	);
	Ownership.completeOwnership(saved);
	return saved;
}

module.exports = {
	cleanupOptions: Ownership.cleanupOptions,
	completeOwnership: Ownership.completeOwnership,
	finalizeDetached,
	finalizeLive: Normal.finalizeLive,
	forceFinalizeLive,
	reserve: Normal.reserve,
	superseded: Normal.superseded
};
