//B"H // Boruch Hashem // Blessed is He

const State = require("./state.js");

/**
 * @file Presents legacy collaboration through the canonical Mission Room without artificial gates.
 * @description The Awtsmoos lets work continue freely until a real human interruption requires an
 * answer. Awtsmoos.com exposes precise next suggestions while reserving mandatory gates for actual
 * blocking room messages, so advice stays useful without becoming ceremony.
 */
function inviteText(mission, input = {}) {
	const collaboration = State.ensure(mission, input);
	const root = collaboration.projectRoot ? ` Project root: ${collaboration.projectRoot}.` : "";
	return `Join Mission ${mission.id}, room ${collaboration.roomId}.${root} Call missionRoomJoin with a unique agentId, then missionAgentSync before claiming or delegating non-overlapping work.`;
}

function response(mission, extra = {}) {
	const blockingMessages = extra.blockingUserMessages || [];
	const blocking = blockingMessages.length > 0 || Boolean(
		extra.userMessage?.requiresResponse && extra.userMessage?.status === "open"
	);
	const suggested = extra.mustCallNext || extra.nextSuggestedToolCall || {
		action: "missionAgentSync",
		missionId: mission.id,
		auto: true
	};
	return {
		...extra,
		missionId: mission.id,
		roomId: mission.room?.id,
		next: suggested,
		nextSuggestedToolCall: suggested,
		mustCallNext: blocking ? suggested : undefined,
		finalAnswerAllowed: !blocking,
		mustContinue: blocking,
		responseFocus: blocking ? {
			oneMainThing: "Respond to the open room user message before unrelated work.",
			mustAnswerGate: true,
			expectedAction: suggested.action
		} : null,
		multipleChoiceSelfInterrogation: blocking ? {
			prompt: "A room user message requires a response.",
			choices: [{ key: "A", text: "Respond now", action: suggested.action, payload: suggested }],
			expectedAnswerFormat: "A"
		} : null,
		instructions: instructions(mission.id)
	};
}

function instructions(missionId) {
	return {
		status: { action: "missionRoomStatus", missionId },
		join: { action: "missionRoomJoin", missionId, agentId: "<unique-agent-id>", role: "worker" },
		delegate: { action: "missionAgentDelegate", missionId, agentId: "<from-agent>", toAgent: "<agent-id>", title: "<task>" },
		sync: { action: "missionAgentSync", missionId, agentId: "<agent-id>" },
		inbox: { action: "missionRoomInbox", missionId, agentId: "<agent-id>" },
		audit: { action: "missionAgentAudit", missionId },
		scheduler: { action: "missionRoomSchedulerStatus", missionId }
	};
}

module.exports = { instructions, inviteText, response };
