//B"H
//Boruch Hashem
//Blessed be He

const Mission = require("../index.js");
const Sessions = require("../agentSessionStore.js");
const Work = require("../workRegistry.js");
const Paths = require("./paths.js");

/**
 * @file Lets an agent return discoveries, evidence, and improvement ideas to mission truth.
 * @description
 * A chat contributes findings but never owns them. The Tunnel immediately converts concrete
 * discoveries into durable work so replacement agents inherit them without transcript replay.
 */
async function record(config, input = {}) {
	const session = input.agentSessionId ? await Sessions.load(config, input.agentSessionId) : null;
	const missionId = input.missionId || session?.activeMissionId || "";
	const mission = missionId ? await Mission.load(config, missionId) : null;
	if (!mission) return { ok: false, reason: "mission_not_found", missionId };
	const anchors = Paths.ensure(config, mission, input);
	const workItems = [];
	for (const discovery of normalizeDiscoveries(input)) {
		const result = Work.register(mission, anchors.projectRoot, {
			...discovery,
			absolutePaths: discovery.absolutePaths?.length
				? discovery.absolutePaths
				: anchors.absolutePaths,
			origin: discovery.origin || "agent-discovery"
		});
		workItems.push(result.item);
	}
	const evidence = input.evidence || input.proof
		? Mission.evidence(mission, {
			kind: input.evidenceKind || "agent_report",
			claim: input.summary || input.message || "Agent reported mission evidence",
			proof: input.evidence || input.proof,
			ok: input.ok !== false
		})
		: null;
	mission.improvementBacklog ||= [];
	mission.improvementBacklog.push(...normalizeImprovements(input, anchors.absolutePaths));
	mission.improvementBacklog = mission.improvementBacklog.slice(-100);
	await Mission.save(config, mission);
	return { ok: true, missionId, workItems, evidence, improvements: mission.improvementBacklog };
}

function normalizeDiscoveries(input = {}) {
	const values = input.discoveries || input.remainingWork || input.work || [];
	return [].concat(values || []).filter(Boolean).map((value, index) => {
		const item = typeof value === "string" ? { title: value } : value;
		return {
			...item,
			idempotencyKey: item.idempotencyKey || `agent-report:${item.title || index}`,
			title: item.title || item.description || `Discovered work ${index + 1}`,
			description: item.description || item.title || "",
			state: item.state || "discovered",
			priority: item.priority || "normal"
		};
	});
}

function normalizeImprovements(input = {}, absolutePaths = []) {
	return [].concat(input.improvements || []).filter(Boolean).map((value, index) => {
		const item = typeof value === "string" ? { title: value } : value;
		return {
			id: item.id || `improvement_${Date.now().toString(36)}_${index}`,
			title: item.title || item.description || `Improvement ${index + 1}`,
			description: item.description || item.title || "",
			absolutePaths: item.absolutePaths || absolutePaths,
			priority: item.priority || "normal",
			state: item.state || "proposed",
			at: new Date().toISOString()
		};
	});
}

module.exports = { normalizeDiscoveries, normalizeImprovements, record };
