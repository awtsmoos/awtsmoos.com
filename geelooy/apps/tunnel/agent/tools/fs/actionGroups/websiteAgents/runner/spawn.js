// B"H
// Boruch Hashem
// Blessed is He

const Context = require("./context.js");
const Admission = require("./spawnAdmission.js");
const Delivery = require("./browserDelivery.js");
const { Spawning, Store, active } = Context.shared;
const seedPendingChildren = Context.reference("seedPendingChildren");
const schedule = Context.reference("schedule");
const scheduleWake = Context.reference("scheduleWake");
const failure = Context.reference("failure");

/**
 * @file Admits recursive intention durably but reports success only after real browser delivery.
 * @description
 * The Awtsmoos distinguishes a proposed helper, a room-seeded peer, and a living worker.
 * Awtsmoos.com therefore waits for durable proof that the exact child prompt crossed a
 * physical ChatGPT tab, received an accepted response, and the owned tab closed cleanly.
 */
async function spawn(config, input = {}) {
	const record = parentRecord(input);
	if (!record) return failure("unknown_parent_website_mission");
	const parentAgentId = String(input.parentAgentId || input.logicalAgentId || "").trim();
	if (!parentAgentId) return failure("missing_parent_agent_id");

	const request = spawnRequest(input);
	const admission = Spawning.admit(record.id, parentAgentId, [request]);
	const policy = admission.record?.plan?.subagentPolicy || {};
	const activation = Admission.evaluate(policy);
	const remembered = Admission.remember(Store, record.id, activation) || activation;
	const backlogBefore = Admission.metrics(admission.record);

	if (backlogBefore.backlog > 0) {
		await activate(config, record.id, activation);
	}

	const latest = Store.read(record.id);
	const childAgentIds = admittedChildIds(admission, latest, parentAgentId, request.key);
	const delivery = input.waitForDelivery === false
		? Delivery.inspect(latest, childAgentIds)
		: await Delivery.wait(Store, record.id, childAgentIds, {
			waitMs: input.deliveryWaitMs || input.waitMs,
			pollMs: input.deliveryPollMs
		});

	return response(record, admission, remembered, childAgentIds, delivery);
}

/** Builds one stable child request from the public spawn payload. */
function spawnRequest(input = {}) {
	return {
		key: input.requestKey || input.spawnRequestKey || input.childRequestId,
		role: input.role || input.childRole || "specialist",
		scope: input.scope || input.childScope || ".",
		prompt: input.childPrompt || input.prompt || input.goal || input.message
	};
}

/** Starts or wakes browser work according to the shared pressure policy. */
async function activate(config, websiteMissionId, activation) {
	if (!activation.allowActivation) {
		scheduleWake(config, websiteMissionId, activation.wakeMs);
		return;
	}
	await seedPendingChildren(config, websiteMissionId, activation.quantum);
	if (active.has(websiteMissionId)) {
		scheduleWake(config, websiteMissionId, activation.wakeMs);
		return;
	}
	schedule(config, websiteMissionId);
}

/** Resolves stable child IDs from fresh admission, duplicate admission, or durable state. */
function admittedChildIds(admission = {}, record = {}, parentAgentId = "", requestKey = "") {
	const direct = [...(admission.accepted || []), ...(admission.duplicates || [])]
		.map((item) => String(item.childAgentId || ""))
		.filter(Boolean);
	if (direct.length) return [...new Set(direct)];
	return (record.agents || [])
		.filter((agent) => agent.parentAgentId === parentAgentId &&
			agent.spawnRequestKey === requestKey)
		.map((agent) => agent.id);
}

/** Builds a truthful spawn response whose ok flag means browser delivery, not admission. */
function response(record, admission, activation, childAgentIds, delivery) {
	const latest = Store.read(record.id);
	return {
		ok: delivery.ok === true,
		pending: delivery.pending === true,
		failed: delivery.failed === true,
		state: delivery.state,
		action: "aiAgentSpawnWebsiteMission",
		websiteMissionId: record.id,
		missionId: record.missionId,
		admitted: (admission.accepted || []).length > 0 || (admission.duplicates || []).length > 0,
		accepted: admission.accepted,
		duplicates: admission.duplicates,
		rejected: admission.rejected,
		childAgentIds,
		activation,
		browserDelivery: delivery,
		subagentBacklog: Admission.metrics(latest),
		check: { action: "websiteAgentMissionStatus", websiteMissionId: record.id }
	};
}

function parentRecord(input) {
	const websiteId = input.parentWebsiteMissionId || input.websiteMissionId;
	if (websiteId) return Store.read(websiteId);
	const roomId = String(input.parentMissionId || input.missionId || "");
	return Store.list(200).find((record) => record.missionId === roomId) || null;
}

function requested(input = {}) {
	return Boolean(input.parentWebsiteMissionId || input.parentAgentId ||
		input.requestKey || input.spawnRequestKey || input.childRequestId);
}

Context.register("spawn", spawn);
module.exports = { admittedChildIds, requested, response, spawn, spawnRequest };
