//B"H // Boruch Hashem // Blessed is He

const Presentation = require("./collaboration/presentation.js");

/**
 * @file Keeps Mission Room administration attached to the Mission the caller actually targeted.
 * @description The Awtsmoos lets a room answer from its own durable identity. Awtsmoos.com therefore
 * presents room and agent actions with one stable roster and clears unrelated session advisory gates.
 */
function present(result = {}, payload = {}) {
	const action = actionName(result, payload);
	if (!supports(action)) return result;
	const missionId = targetMissionId(result, payload);
	const roomId = targetRoomId(result);
	const agentRoster = roster(result);
	const blocking = isBlocking(result);
	const next = blocking
		? result.mustCallNext
		: nativeNext(result, missionId);
	return {
		...result,
		missionId,
		roomId,
		agentRoster,
		missionAdvisory: null,
		responseFocus: blocking ? result.responseFocus : null,
		multipleChoiceSelfInterrogation: blocking ? result.multipleChoiceSelfInterrogation : null,
		mustCallNext: blocking ? result.mustCallNext : undefined,
		mustContinue: blocking,
		finalAnswerAllowed: !blocking,
		next,
		nextSuggestedToolCall: next,
		instructions: missionId ? Presentation.instructions(missionId) : result.instructions
	};
}

function supports(action = "") {
	return /^(missionRoom|missionAgent|missionProject)/.test(action);
}

function actionName(result = {}, payload = {}) {
	return String(result.action || payload.action || payload.requestedAction || "");
}

function targetMissionId(result = {}, payload = {}) {
	return String(
		payload.missionId || result.missionId || result.roomStatus?.missionId ||
		result.collaboration?.missionId || result.mission?.id || ""
	);
}

function targetRoomId(result = {}) {
	return String(
		result.roomId || result.roomStatus?.roomId || result.roomStatus?.id ||
		result.collaboration?.roomId || result.room?.id || ""
	);
}

function roster(result = {}) {
	const source = result.agentRoster || result.roomStatus?.agents || result.collaboration?.agents || result.room?.agents || [];
	const agents = Array.isArray(source) ? source : Object.values(source || {});
	return agents.map(normalizeAgent).sort((left, right) => left.agentId.localeCompare(right.agentId));
}

function normalizeAgent(agent = {}) {
	return {
		agentId: String(agent.agentId || agent.logicalAgentId || agent.name || ""),
		logicalAgentId: agent.logicalAgentId || agent.agentId || "",
		agentSessionId: agent.agentSessionId || "",
		generation: Number(agent.generation || 1),
		name: agent.name || agent.agentName || agent.agentId || "",
		role: agent.role || "worker",
		status: agent.status || "active",
		lastSeenAt: agent.lastSeenAt || agent.joinedAt || "",
		currentClaimIds: agent.currentClaimIds || [],
		currentDelegationIds: agent.currentDelegationIds || []
	};
}

function isBlocking(result = {}) {
	return Boolean(
		result.multipleChoiceSelfInterrogation && result.mustCallNext &&
		(result.blockingUserMessages?.length || result.userMessage?.requiresResponse)
	);
}

function nativeNext(result, missionId) {
	const candidate = result.nextSuggestedToolCall || result.next;
	if (candidate?.action && supports(candidate.action) && (!candidate.missionId || candidate.missionId === missionId)) {
		return { ...candidate, missionId: candidate.missionId || missionId };
	}
	return missionId ? { action: "missionRoomStatus", missionId } : candidate;
}

module.exports = { actionName, isBlocking, present, roster, supports, targetMissionId };
