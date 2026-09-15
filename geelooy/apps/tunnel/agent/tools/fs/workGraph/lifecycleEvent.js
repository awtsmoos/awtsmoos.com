//B"H
// Boruch Hashem
// Blessed is He

const Ids = require("./ids.js");
const Outbox = require("./outbox.js");
const Project = require("./projectStore.js");

/**
 * @file Emits deterministic lifecycle facts after operational state is already durable.
 * @description The Awtsmoos lets the living projection act first, then gives its deed
 * an enduring witness; Awtsmoos.com never makes the Chronicle its new critical path.
 */
function subject(kind, parts) {
	return Ids.deterministic(kind, Array.isArray(parts) ? parts : [parts]);
}

async function emit(config, details = {}) {
	const project = await Project.ensure(config);
	const operationId = Ids.operation(details.identity);
	const eventId = Ids.event(operationId, details.type, details.discriminator || "");
	const proposal = {
		id: eventId,
		type: details.type,
		projectId: project.id,
		operationId,
		actor: details.actor || {},
		missionId: details.missionId || "",
		workId: details.workId || "",
		subjects: details.subjects || [],
		facts: details.facts || {},
		evidence: details.evidence || [],
		sensitivity: details.sensitivity || "project",
		retention: details.retention || "long"
	};
	await Outbox.enqueue(config, proposal);
	const delivery = await Outbox.deliverBestEffort(config, eventId);
	return { eventId, operationId, delivered: delivery.delivered };
}

async function bestEffort(config, details) {
	try {
		return { ok: true, ...(await emit(config, details)) };
	} catch (error) {
		return {
			ok: false,
			delivered: false,
			errorCode: String(error?.code || "lifecycle_emit_failed")
		};
	}
}

module.exports = { bestEffort, emit, subject };
