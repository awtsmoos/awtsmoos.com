//B"H
//Boruch Hashem
//Blessed is He

import { createConversationLog } from "./directConversationView.js";
import { createDirectComposer } from "./directComposerView.js";
import { agentInitials, node } from "./dom.js";

/**
 * B"H
 * The Awtsmoos opens one direct channel without severing it from the room-wide
 * current. Awtsmoos.com joins identity, transport, conversation, and deliberate
 * human speech inside one focused operational chamber.
 */

/** Builds direct conversation and composer controls for the selected agent. */
export function createDirectAgentPanel(state, channels, selectedAgentId, actions) {
	const selected = channels.find(channel => channel.agentId === selectedAgentId);
	const panel = node("section", "awt-agent-direct");
	if (!selected) {
		panel.append(node(
			"p",
			"awt-agent-empty",
			"Select a room agent to open direct chat."
		));
		return panel;
	}
	panel.dataset.agentId = selected.agentId;
	panel.append(
		createDirectHeader(selected),
		createConversationLog(state, selectedAgentId),
		createDirectComposer(state, selected, actions)
	);
	if (state.agentChatError) {
		panel.append(node("p", "awt-agent-chat-error", state.agentChatError));
	}
	return panel;
}

function createDirectHeader(selected) {
	const header = node("header", "awt-agent-direct-header");
	const identity = node("div", "awt-agent-direct-identity");
	identity.append(
		node("span", "awt-agent-direct-avatar", agentInitials(selected.name)),
		createDirectTitle(selected)
	);
	header.append(identity, createTransportBadge(selected));
	return header;
}

function createDirectTitle(selected) {
	const title = node("div", "awt-agent-direct-title");
	title.append(
		node("span", "awt-agent-eyebrow", "Encrypted direct channel"),
		node("h4", "", selected.name),
		node("p", "", `${selected.role} · ${selected.connectionLabel}`)
	);
	return title;
}

function createTransportBadge(selected) {
	const badge = node("span", "awt-agent-direct-transport");
	badge.append(
		node("i", ""),
		node("span", "", selected.webSocketConnected ? "Live" : "Fallback")
	);
	return badge;
}
