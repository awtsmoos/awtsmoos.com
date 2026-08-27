//B"H
//Boruch Hashem
//Blessed is He

import { websiteMissionIdFor } from "../../websiteMissionRegistry.js";
import { agentEventsForRoom, buildAgentChannels } from "./channelBuilder.js";
import { eventAgentIds } from "./eventAgents.js";

export { buildAgentChannels };

export function ensureSelectedAgent(state, channels = []) {
	if (channels.some(channel => channel.agentId === state.selectedAgentId)) {
		return state.selectedAgentId;
	}
	state.selectedAgentId = channels.find(channel => channel.isWorking)?.agentId ||
		channels[0]?.agentId || "";
	return state.selectedAgentId;
}

export function agentConversation(state, agentId) {
	return agentEventsForRoom(state)
		.filter(event => eventAgentIds(event).includes(agentId))
		.filter(event => /message|response|chat/i.test(String(event.type || "")) ||
			Boolean(event.payload?.body));
}

/** Direct chat wakes the exact website agent when this room belongs to a team. */
export function directAgentMessagePayload(missionId, fromAgent, toAgent, body) {
	const roomId = String(missionId || "").trim();
	const websiteMissionId = websiteMissionIdFor(roomId);
	if (websiteMissionId) {
		return {
			action: "websiteAgentMissionMessage",
			websiteMissionId,
			missionId: roomId,
			agentId: String(fromAgent || "control-room-human").trim(),
			toAgent: String(toAgent || "").trim(),
			kind: "user-direct-message",
			body: String(body || "").trim(),
			message: String(body || "").trim(),
			requiresResponse: true
		};
	}
	return {
		action: "missionAgentMessage",
		missionId: roomId,
		agentId: String(fromAgent || "control-room-human").trim(),
		toAgent: String(toAgent || "").trim(),
		kind: "user-direct-message",
		body: String(body || "").trim(),
		requiresResponse: true
	};
}
