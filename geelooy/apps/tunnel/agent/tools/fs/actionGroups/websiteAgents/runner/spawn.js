// B"H
// Boruch Hashem
// Blessed is He

const Context = require("./context.js");
const { Spawning, Store, active } = Context.shared;
const seedPendingChildren = Context.reference("seedPendingChildren");
const schedule = Context.reference("schedule");
const scheduleWake = Context.reference("scheduleWake");
const failure = Context.reference("failure");

/** Admits one durable child into its parent's existing website mission and room. */
async function spawn(config, input = {}) {
	const record = parentRecord(input);
	if (!record) return failure("unknown_parent_website_mission");
	const parentAgentId = String(input.parentAgentId || input.logicalAgentId || "").trim();
	if (!parentAgentId) return failure("missing_parent_agent_id");
	const request = {
		key: input.requestKey || input.spawnRequestKey || input.childRequestId,
		role: input.role || input.childRole || "specialist",
		scope: input.scope || input.childScope || ".",
		prompt: input.childPrompt || input.prompt || input.goal || input.message
	};
	const admission = Spawning.admit(record.id, parentAgentId, [request]);
	await seedPendingChildren(config, record.id);
	if (admission.accepted.length) {
		if (active.has(record.id)) scheduleWake(config, record.id, 1000);
		else schedule(config, record.id);
	}
	return {
		ok: admission.accepted.length > 0 || admission.duplicates.length > 0,
		action: "aiAgentSpawnWebsiteMission",
		websiteMissionId: record.id,
		missionId: record.missionId,
		accepted: admission.accepted,
		duplicates: admission.duplicates,
		rejected: admission.rejected,
		check: { action: "websiteAgentMissionStatus", websiteMissionId: record.id }
	};
}

function parentRecord(input) {
	const websiteId = input.parentWebsiteMissionId || input.websiteMissionId;
	if (websiteId) return Store.read(websiteId);
	const roomId = String(input.parentMissionId || input.missionId || "");
	return Store.list(200).find(record => record.missionId === roomId) || null;
}

function requested(input = {}) {
	return Boolean(
		input.parentWebsiteMissionId || input.parentAgentId || input.requestKey ||
		input.spawnRequestKey || input.childRequestId
	);
}

Context.register("spawn", spawn);
module.exports = { requested, spawn };
