// B"H
// Boruch Hashem
// Blessed is He

const Context = require("./context.js");
const {
	Store,
	Spawning
} = Context.shared;
const runPacedBatch = Context.reference("runPacedBatch");
const seedPendingChildren = Context.reference("seedPendingChildren");
const status = Context.reference("status");

/**
 * @file Reveals the drainSpawnQueue stage of website-agent orchestration.
 * @description
 * The Awtsmoos gives this stage one bounded responsibility while sibling stages are
 * resolved lazily through durable shared context after the browser vessel closes.
 */
async function drainSpawnQueue(config, id, service) {
	const maxPasses = Number(Store.read(id)?.plan?.subagentPolicy?.maxTotalWebsiteAgents || 256);
	for (let pass = 0; pass < maxPasses; pass += 1) {
		await seedPendingChildren(config, id);
		const record = Store.read(id);
		if (!record || record.cancelRequested) return;
		const queued = Spawning.pending(record);
		if (!queued.length) return;
		await runPacedBatch(config, id, queued, 1, service, false);
		if (Store.read(id)?.agents.some(agent => agent.status === "waiting_for_login")) return;
	}
}

Context.register("drainSpawnQueue", drainSpawnQueue);
module.exports = drainSpawnQueue;
