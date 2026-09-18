//B"H // Boruch Hashem // Blessed is He

const Context = require("./context.js");
const Admission = require("./spawnAdmission.js");
const Delivery = require("./browserDelivery.js");
const Discovery = require("./spawnDiscovery.js");
const { Spawning, Store, active } = Context.shared;
const seedPendingChildren = Context.reference("seedPendingChildren");
const schedule = Context.reference("schedule");
const scheduleWake = Context.reference("scheduleWake");
const failure = Context.reference("failure");

/**
 * @file Admits one durable recursive website-agent request with automatic lineage discovery.
 * @description The Awtsmoos lets a child request discover its living durable Mission and sponsor
 * without asking a Shliach to remember historical room IDs. Explicit evidence wins, request-key
 * evidence deduplicates next, and Awtsmoos.com falls back only to durable active lineage.
 */
async function spawn(config, input = {}) {
	const discovery = Discovery.resolve(Store, input);
	if (!discovery.ok) return { ...failure(discovery.reason), discovery: publicDiscovery(discovery) };
	const record = discovery.record;
	const parentAgentId = discovery.parentAgentId;
	const request = spawnRequest(input);
	const admission = Spawning.admit(record.id, parentAgentId, [request]);
	const policy = admission.record?.plan?.subagentPolicy || {};
	const activation = Admission.evaluate(policy);
	const remembered = Admission.remember(Store, record.id, activation) || activation;
	const backlogBefore = Admission.metrics(admission.record);
	if (backlogBefore.backlog > 0) await activate(config, record, activation);
	const latest = Store.read(record.id);
	const childAgentIds = admittedChildIds(admission, latest, parentAgentId, request.key);
	const delivery = input.waitForDelivery === false
		? Delivery.inspect(latest, childAgentIds)
		: await Delivery.wait(Store, record.id, childAgentIds, {
			waitMs: input.deliveryWaitMs || input.waitMs,
			pollMs: input.deliveryPollMs
		});
	return response(record, admission, remembered, childAgentIds, delivery, discovery);
}

function spawnRequest(input = {}) {
	return {
		key: input.requestKey || input.spawnRequestKey || input.childRequestId,
		role: input.role || input.childRole || "specialist",
		scope: input.scope || input.childScope || ".",
		prompt: input.childPrompt || input.prompt || input.goal || input.message
	};
}

async function activate(config, record, activation) {
	if (!activation.allowActivation) {
		scheduleWake(config, record.id, activation.wakeMs);
		return;
	}
	await seedPendingChildren(config, record.id, activation.quantum);
	if (active.has(record.id)) {
		scheduleWake(config, record.id, activation.wakeMs);
		return;
	}
	schedule(config, record.id);
}

function admittedChildIds(admission = {}, record = {}, parentAgentId = "", requestKey = "") {
	const direct = [...(admission.accepted || []), ...(admission.duplicates || [])]
		.map(item => String(item.childAgentId || ""))
		.filter(Boolean);
	if (direct.length) return [...new Set(direct)];
	return (record.agents || [])
		.filter(agent => agent.parentAgentId === parentAgentId && agent.spawnRequestKey === requestKey)
		.map(agent => agent.id);
}

function response(record, admission, activation, childAgentIds, delivery, discovery) {
	const latest = Store.read(record.id);
	return {
		ok: delivery.ok === true,
		pending: delivery.pending === true,
		failed: delivery.failed === true,
		state: delivery.state,
		action: "aiAgentSpawnWebsiteMission",
		websiteMissionId: record.id,
		missionId: record.missionId,
		parentAgentId: discovery.parentAgentId,
		discovery: publicDiscovery(discovery),
		admitted: (admission.accepted || []).length > 0 || (admission.duplicates || []).length > 0,
		accepted: admission.accepted,
		duplicates: admission.duplicates,
		rejected: admission.rejected,
		childAgentIds,
		activation,
		browserDelivery: delivery,
		subagentBacklog: Admission.metrics(latest),
		check: { action: "aiAgentWebsiteMissionStatus", websiteMissionId: record.id }
	};
}

function publicDiscovery(discovery = {}) {
	return {
		ok: discovery.ok === true,
		reason: discovery.reason || "",
		websiteMissionId: discovery.websiteMissionId || discovery.record?.id || "",
		missionId: discovery.missionId || discovery.record?.missionId || "",
		parentAgentId: discovery.parentAgentId || "",
		recordSource: discovery.recordSource || discovery.source || "",
		sponsorSource: discovery.sponsorSource || "",
		requestKey: discovery.requestKey || ""
	};
}

function requested(input = {}) {
	return Boolean(input.parentWebsiteMissionId || input.websiteMissionId || input.parentAgentId ||
		input.parentMissionId || input.missionId || input.requestKey || input.spawnRequestKey || input.childRequestId);
}

Context.register("spawn", spawn);
module.exports = { admittedChildIds, publicDiscovery, requested, response, spawn, spawnRequest };
