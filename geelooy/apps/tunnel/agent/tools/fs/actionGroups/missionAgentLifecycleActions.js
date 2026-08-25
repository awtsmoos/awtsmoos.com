// B"H
// Boruch Hashem
// Blessed is He

const Mission = require("../mission/index.js");
const Evidence = require("../mission/successorCompletionEvidence.js");
const Identity = require("../mission/successorIdentity.js");
const Coordinator = require("../mission/successorCoordinator.js");
const Activation = require("../mission/successorActivation.js");

/**
 * @file Overrides only agent completion with recoverable automatic successor handoff.
 * @description
 * The Awtsmoos lets a finished shliach become history without letting unfinished work fall;
 * Awtsmoos.com reuses durable completion testimony after disconnect, saves successor custody
 * before activation, and resumes the same handoff until one exact successor carries the call.
 */
function buildMissionAgentLifecycleActions(context, baseActions = {}) {
	const { config, payload } = context;
	return {
		missionAgentComplete: () => completeAgent(
			config,
			payload,
			baseActions.missionAgentComplete
		)
	};
}

async function completeAgent(config, payload, legacyComplete) {
	const missionId = String(payload.missionId || payload.id || payload.target || "");
	const predecessorId = Identity.predecessorId(payload);
	if (!missionId || !predecessorId) {
		return { ok: false, action: "missionAgentComplete", error: "mission_and_agent_required" };
	}
	let mission = await Mission.load(config, missionId);
	if (!mission) return { ok: false, action: "missionAgentComplete", error: "mission_not_found" };
	let completionEvent = Evidence.find(mission, predecessorId);
	let legacyResult = null;
	if (!completionEvent) {
		legacyResult = await legacyComplete();
		if (legacyResult?.ok === false) return legacyResult;
		mission = await Mission.load(config, missionId);
		completionEvent = Evidence.find(mission, predecessorId);
	}
	if (!completionEvent) {
		return { ok: false, action: "missionAgentComplete", error: "completion_evidence_missing" };
	}
	const reservation = await Coordinator.reserve(config, {
		...payload,
		missionId,
		agentId: predecessorId
	}, completionEvent);
	if (!reservation.ok || !reservation.activate) {
		return response(legacyResult, mission, reservation.record);
	}
	const activation = await Activation.activate(config, reservation.activate.activation);
	const finalized = await Coordinator.finalize(
		config,
		missionId,
		reservation.record.terminalKey,
		activation
	);
	mission = await Mission.load(config, missionId);
	return response(legacyResult, mission, finalized.record);
}

function response(legacyResult, mission, successor) {
	return {
		...(legacyResult || {}),
		ok: true,
		action: "missionAgentComplete",
		successor,
		next: successor?.state === "issued" && successor.successorId
			? { action: "missionAgentSync", missionId: mission.id, agentId: successor.successorId }
			: Mission.nextStep(mission, { autoAdvance: true }),
		mission: Mission.report(mission)
	};
}

module.exports = {
	buildMissionAgentLifecycleActions,
	completeAgent
};
