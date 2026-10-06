//B"H
// Boruch Hashem
// Blessed is He

const ReplayIdentity = require("../actionReplayIdentity.js");
const { performance } = require("node:perf_hooks");
const Aliases = require("./mutationAliases.js");
const Event = require("./mutationEvent.js");
const Result = require("./mutationResult.js");
const Targets = require("./mutationTargets.js");
const Context = require("./provenanceContext.js");
const Witness = require("./fileWitness.js");
const Operations = require("./operationStore.js");
const Outbox = require("./outbox.js");

/**
 * @file Wraps real mutation actions so success and provenance survive independently.
 * @description The Awtsmoos lets a completed deed remain complete while its witness
 * waits safely in the outbox; Awtsmoos.com never repeats work merely because indexing slept.
 */
async function run(config, payload, producer) {
	const action = ReplayIdentity.canonicalAction(payload);
	if (!Targets.isMutation(action)) return producer();
	const timingStart = performance.now();
	const context = await Context.build(config, payload);
	const targets = Targets.forAction(context.action, payload);
	const before = await Witness.captureAll(config, targets);
	await Operations.transition(config, context.operationId, "prepared", {
		requestId: context.requestId,
		action: context.action,
		targets,
		before
	});
	await Operations.transition(config, context.operationId, "started");
	const preparedAt = performance.now();
	let result;
	try {
		result = await producer();
	} catch (error) {
		await Operations.transition(config, context.operationId, "failed", {
			message: String(error?.message || error)
		});
		throw error;
	}
	const executedAt = performance.now();
	if (!Result.applied(context.action, result)) {
		await Operations.transition(config, context.operationId, "finalized", { applied: false });
		return result;
	}
	await Operations.transition(config, context.operationId, "irreversible");
	const beforeMap = Witness.byPath(before);
	const postIdentity = await Aliases.afterSuccess(config, context.action, targets, beforeMap);
	const after = await Witness.captureAll(config, targets, postIdentity);
	const proposal = Event.build(context, before, after, result);
	await Outbox.enqueue(config, proposal);
	const delivery = await Outbox.deliverBestEffort(config, proposal.id);
	await Operations.transition(config, context.operationId, "verified", {
		eventId: proposal.id,
		ledgerDelivered: delivery.delivered,
		deliveryErrorCode: delivery.errorCode
	});
	await Operations.transition(config, context.operationId, "finalized", { applied: true });
	if (payload.performanceDiagnostics !== true) return result;
	return { ...result, timingMs: { prepare: Math.round(preparedAt - timingStart),
		execute: Math.round(executedAt - preparedAt), provenance: Math.round(performance.now() - executedAt),
		total: Math.round(performance.now() - timingStart) } };
}

module.exports = { run };
