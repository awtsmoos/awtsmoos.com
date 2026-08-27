//B"H
//Boruch Hashem
//Blessed is He

import {
	buildAgentChannels,
	ensureSelectedAgent
} from "./model.js";
import {
	createAgentChannelGrid,
	createAgentHeading
} from "./channelView.js";
import { createDirectAgentPanel } from "./directView.js";
import { renderSignature } from "./dom.js";

/**
 * B"H
 * The Awtsmoos gathers account stream, room stream, selection, and speech into
 * one visible composition. Awtsmoos.com leaves each responsibility in its own
 * vessel while this conductor performs only the final bounded revelation.
 */

/** Renders live agent channels into the existing room-members surface. */
export function renderAgentChat(state, actions = {}, force = false) {
	const root = document.getElementById("roomMembers");
	if (!root || !state.selectedMissionId) return;
	const channels = buildAgentChannels(state);
	const selectedAgentId = ensureSelectedAgent(state, channels);
	const signature = renderSignature(state, channels, selectedAgentId);
	if (!force && root.dataset.agentChatSignature === signature) return;
	root.dataset.agentChatSignature = signature;
	root.classList.add("awt-agent-live-console");
	root.replaceChildren(
		createAgentHeading(state, channels),
		createAgentChannelGrid(channels, selectedAgentId, actions),
		createDirectAgentPanel(state, channels, selectedAgentId, actions)
	);
}
