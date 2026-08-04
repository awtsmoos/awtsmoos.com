// B"H
// Boruch Hashem
// Blessed is He

const Context = require("./context.js");
const {
	Store
} = Context.shared;
const recoverAcceptedTurns = Context.reference("recoverAcceptedTurns");
const ensureAuthentication = Context.reference("ensureAuthentication");
const pauseForLogin = Context.reference("pauseForLogin");
const runPacedBatch = Context.reference("runPacedBatch");
const drainSpawnQueue = Context.reference("drainSpawnQueue");
const seedPendingChildren = Context.reference("seedPendingChildren");
const status = Context.reference("status");
const finalize = Context.reference("finalize");
const needsContinuation = Context.reference("needsContinuation");
const reconcileOrphanedTurns = Context.reference("reconcileOrphanedTurns");
const cancel = Context.reference("cancel");
const loadService = Context.reference("loadService");
const event = Context.reference("event");

/**
 * @file Reveals the run stage of website-agent orchestration.
 * @description
 * The Awtsmoos gives this stage one bounded responsibility while sibling stages are
 * resolved lazily through durable shared context after the browser vessel closes.
 */
async function run(config, id) {
	let record = Store.read(id);
	if (!record || record.cancelRequested || record.status === "complete") return record;
	record = reconcileOrphanedTurns(id);
	record = Store.update(id, current => {
		current.status = "running";
		current.phase = "checking_authentication";
		return current;
	});
	const service = await loadService(config);
	const ready = await ensureAuthentication(config, record, service);
	if (!ready) return Store.read(id);

	record = Store.update(id, current => {
		current.status = "running";
		current.phase = "launching_agents";
		for (const agent of current.agents) {
			if (agent.status === "waiting_for_login") agent.status = "queued";
		}
		current.events.push(event("mission_running", {
			agentCount: current.agents.length,
			startSpacingMs: current.plan.startSpacingMs
		}));
		return current;
	});
	await recoverAcceptedTurns(config, id, service);
	await seedPendingChildren(config, id);
	if (Store.read(id)?.agents.some(agent => agent.status === "waiting_for_login")) {
		return pauseForLogin(config, id);
	}

	for (let round = 1; round <= record.plan.collaborationRounds; round += 1) {
		record = Store.read(id);
		if (!record || record.cancelRequested) return cancel(record);
		const agents = record.agents.filter(agent =>
			agent.round < round &&
			agent.roomSeeded !== false &&
			!(agent.singleUse && agent.status === "complete") &&
			!["dispatched", "awaiting_recovery", "failed", "waiting_for_login", "claim_conflict"].includes(agent.status)
		);
		await runPacedBatch(config, id, agents, round, service, false);
		await drainSpawnQueue(config, id, service);
		if (Store.read(id)?.agents.some(agent => agent.status === "waiting_for_login")) {
			return pauseForLogin(config, id);
		}
	}

	for (let cycle = 0; cycle < record.plan.maxContinuationTurns; cycle += 1) {
		await drainSpawnQueue(config, id, service);
		record = Store.read(id);
		if (!record || record.cancelRequested) return cancel(record);
		const agents = record.agents.filter(agent =>
			needsContinuation(agent) &&
			agent.continuationTurns < record.plan.maxContinuationTurns
		);
		if (!agents.length) break;
		await runPacedBatch(config, id, agents, null, service, true);
		await drainSpawnQueue(config, id, service);
		if (Store.read(id)?.agents.some(agent => agent.status === "waiting_for_login")) {
			return pauseForLogin(config, id);
		}
	}
	return finalize(config, id);
}

Context.register("run", run);
module.exports = run;
