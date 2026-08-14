// B"H
// Boruch Hashem
// Blessed is He

const Context = require("./context.js");
const Admission = require("./spawnAdmission.js");
const Fairness = require("./spawnFairness.js");
const { Store, Spawning } = Context.shared;
const runPacedBatch = Context.reference("runPacedBatch");
const scheduleWake = Context.reference("scheduleWake");
const seedPendingChildren = Context.reference("seedPendingChildren");

/**
 * @file Drains recursive intention in pressure-aware parent-fair quanta above one browser tab.
 * @description The Awtsmoos keeps every branch remembered while Awtsmoos.com rechecks the
 * vessel before each activation breath, yielding immediately when recent pressure says enough.
 */
async function drainSpawnQueue(config, id, service) {
	const initial = Store.read(id);
	if (!initial || initial.cancelRequested) return;
	const policy = initial.plan?.subagentPolicy || {};
	for (let quantumIndex = 0; quantumIndex < 8; quantumIndex += 1) {
		const before = Store.read(id);
		if (!before || before.cancelRequested) return;
		const decision = Admission.evaluate(policy);
		Admission.remember(Store, id, decision);
		const backlog = Admission.metrics(before);
		if (!backlog.backlog) return;
		if (!decision.allowActivation) {
			scheduleWake(config, id, decision.wakeMs);
			return;
		}
		if (quantumIndex >= decision.maxQuanta) break;
		await seedPendingChildren(config, id, decision.quantum);
		const record = Store.read(id);
		if (!record || record.cancelRequested) return;
		const pending = Spawning.pending(record);
		if (!pending.length) break;
		const fairPolicy = Admission.effectivePolicy(policy, decision);
		const plan = Fairness.select(pending, fairPolicy);
		await runPacedBatch(config, id, plan.selected, 1, service, false);
		const after = Store.read(id);
		if (!after || after.cancelRequested) return;
		if (after.agents.some(agent => agent.status === "waiting_for_login")) return;
	}
	const remaining = Store.read(id);
	if (!remaining || remaining.cancelRequested) return;
	const finalDecision = Admission.evaluate(policy);
	const remembered = Admission.remember(Store, id, finalDecision) || finalDecision;
	if (Admission.metrics(remaining).backlog > 0) scheduleWake(config, id, remembered.wakeMs);
}

Context.register("drainSpawnQueue", drainSpawnQueue);
module.exports = drainSpawnQueue;
