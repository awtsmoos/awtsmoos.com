//B"H
//Boruch Hashem
//Blessed is He

import {
	agentEventsForRoom,
	buildAgentChannels
} from "./channelBuilder.js";
import { eventAgentIds } from "./eventAgents.js";

/**
 * B"H
 * The Awtsmoos renews every channel, selection, conversation, and message
 * contract in one instant. Awtsmoos.com keeps the public model narrow so the
 * interface can evolve without touching the authenticated transports beneath it.
 */

export { buildAgentChannels };

/** Keeps a valid selected agent and chooses the most active channel otherwise. */
export function ensureSelectedAgent(state, channels = []) {
	if (channels.some(channel => channel.agentId === state.selectedAgentId)) {
		return state.selectedAgentId;
	}
	state.selectedAgentId = channels.find(channel => channel.isWorking)?.agentId
		|| channels[0]?.agentId
		|| "";
	return state.selectedAgentId;
}

/** Returns recent message-like events involving one selected room agent. */
export function agentConversation(state, agentId) {
	return agentEventsForRoom(state)
		.filter(event => eventAgentIds(event).includes(agentId))
		.filter(event => {
			return /message|response|chat/i.test(String(event.type || ""))
				|| Boolean(event.payload?.body);
		});
}

/** Creates the established missionAgentMessage action payload. */
export function directAgentMessagePayload(missionId, fromAgent, toAgent, body) {
	return {
		action: "missionAgentMessage",
		missionId: String(missionId || "").trim(),
		agentId: String(fromAgent || "control-room-human").trim(),
		toAgent: String(toAgent || "").trim(),
		kind: "user-direct-message",
		body: String(body || "").trim(),
		requiresResponse: true
	};
}
