//B"H
// Boruch Hashem
// Blessed is He

const Project = require("../workGraph/projectStore.js");
const Knowledge = require("../workGraph/knowledgeQuery.js");
const Obligations = require("../workGraph/obligationStore.js");
const Events = require("../workGraph/eventLedger.js");
const Mission = require("../mission/index.js");
const Lock = require("../mission/lock/index.js");
const Work = require("../mission/workRegistry.js");
const Sessions = require("../mission/agentSessionStore.js");
const Debt = require("../mission/autoContinuation/completionDebt.js");
const Continuations = require("../mission/autoContinuation/state.js");

/**
 * @file Builds one read-only Project snapshot from existing authoritative stores.
 * @description The Awtsmoos gives one project many visible faces; Awtsmoos.com projects files,
 * work, agents, meaning, obligations, chronology, and continuation debt without a second truth store.
 */
async function build(config, payload = {}) {
	const project = await Project.ensure(config);
	const lock = payload.lock || Lock.active(config);
	const mission = lock?.missionId ? await Mission.load(config, lock.missionId) : null;
	const missionId = mission?.id || lock?.missionId || "";
	const logicalAgentId = String(payload.logicalAgentId || lock?.logicalAgentId || "");
	const viewer = { logicalAgentId, spawnGroupId: String(payload.spawnGroupId || "") };
	const knowledge = await Knowledge.search(config, {
		missionId,
		currentOnly: payload.currentKnowledgeOnly !== false
	}, viewer);
	const sessions = await Sessions.all(config);
	const obligations = logicalAgentId
		? await Obligations.current(config, {
			logicalAgentId,
			missionId,
			state: payload.obligationState || "open"
		})
		: [];
	const events = (await Events.list(config))
		.filter(event => !missionId || eventMission(event) === missionId)
		.sort((left, right) => Number(right.sequence || 0) - Number(left.sequence || 0))
		.slice(0, Number(payload.maxEvents || 80));
	const debt = mission
		? await Debt.assess(config, mission, lock || {}, { logicalAgentId }, { Mission })
		: null;
	return {
		project,
		lock,
		mission,
		work: mission ? Work.open(mission) : [],
		agents: sessions.filter(session => !missionId || session.activeMissionId === missionId),
		knowledge: knowledge.assertions || [],
		obligations,
		events,
		debt,
		continuations: missionId ? Continuations.list(config, missionId) : []
	};
}

function eventMission(event = {}) {
	return String(event.missionId || event.context?.missionId || "");
}

module.exports = { build, eventMission };
