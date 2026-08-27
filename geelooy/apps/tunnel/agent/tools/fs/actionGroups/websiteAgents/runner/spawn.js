// B"H
// Boruch Hashem
// Blessed is He

const Context = require("./context.js");
const Admission = require("./spawnAdmission.js");
const { Spawning, Store, active } = Context.shared;
const seedPendingChildren = Context.reference("seedPendingChildren");
const schedule = Context.reference("schedule");
const scheduleWake = Context.reference("scheduleWake");
const failure = Context.reference("failure");

/**
 * @file Admits recursive intention with full lineage before pressure-controlled activation.
 * @description
 * The Awtsmoos never discards a useful child merely because the vessel is busy; Awtsmoos.com
 * preserves generation, predecessor, sibling group, and project-relative handoff references
 * while one shared runtime pressure truth decides only when the physical browser may awaken.
 */
async function spawn(config, input = {}) {
	const record = parentRecord(input);
	if (!record) return failure("unknown_parent_website_mission");
	const parentAgentId = String(input.parentAgentId || input.logicalAgentId || "").trim();
	if (!parentAgentId) return failure("missing_parent_agent_id");
	const request = {
		key: input.requestKey || input.spawnRequestKey || input.childRequestId,
		role: input.role || input.childRole || "specialist",
		scope: input.scope || input.childScope || ".",
		prompt: input.childPrompt || input.prompt || input.goal || input.message,
		spawnGroupId: input.spawnGroupId || input.spawnGroup,
		generation: input.generation,
		predecessorAgentId: input.predecessorAgentId,
		handoffPaths: input.handoffPaths || input.references
	};
	const admission = Spawning.admit(record.id, parentAgentId, [request]);
	const policy = admission.record?.plan?.subagentPolicy || {};
	const activation = Admission.evaluate(policy);
	const remembered = Admission.remember(Store, record.id, activation) || activation;
	const backlogBefore = Admission.metrics(admission.record);
	if (backlogBefore.backlog > 0) {
		if (!activation.allowActivation) {
			scheduleWake(config, record.id, activation.wakeMs);
		} else {
			await seedPendingChildren(config, record.id, activation.quantum);
			if (active.has(record.id)) scheduleWake(config, record.id, activation.wakeMs);
			else schedule(config, record.id);
		}
	}
	const latest = Store.read(record.id);
	return {
		ok: admission.accepted.length > 0 || admission.duplicates.length > 0,
		action: "aiAgentSpawnWebsiteMission",
		websiteMissionId: record.id,
		missionId: record.missionId,
		accepted: admission.accepted,
		duplicates: admission.duplicates,
		rejected: admission.rejected,
		activation: remembered,
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
	return Boolean(
		input.parentWebsiteMissionId || input.parentAgentId || input.requestKey ||
		input.spawnRequestKey || input.childRequestId
	);
}

Context.register("spawn", spawn);
module.exports = { requested, spawn };
