//B"H
//Boruch Hashem
//Blessed is He

import { agentConversation } from "./model.js";
import { node } from "./dom.js";

/**
 * B"H
 * The Awtsmoos lets one human word enter one chosen agent-vessel without losing
 * the testimony of the room around it. Awtsmoos.com preserves the draft through
 * every live rerender and sends only through the established mission action API.
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
	const log = createConversationLog(state, selectedAgentId);
	const input = createMessageInput(state, selected, actions);
	const send = createSendButton(state, selected, input, actions);
	panel.append(
		node("h4", "", `Direct chat · ${selected.name}`),
		node(
			"p",
			"awt-agent-direct-note",
			`Live through ${selected.connectionLabel}; messages use missionAgentMessage.`
		),
		log,
		input,
		send
	);
	if (state.agentChatError) {
		panel.append(node("p", "awt-agent-chat-error", state.agentChatError));
	}
	return panel;
}

function createConversationLog(state, selectedAgentId) {
	const log = node("div", "awt-agent-direct-log");
	log.setAttribute("aria-live", "polite");
	for (const event of agentConversation(state, selectedAgentId).slice(-8)) {
		log.append(createMessageRow(event));
	}
	if (!log.children.length) {
		log.append(node("p", "awt-agent-empty", "No direct conversation yet."));
	}
	return log;
}

function createMessageInput(state, selected, actions) {
	const input = node("textarea", "awt-agent-direct-input");
	input.id = "roomAgentDirectMessage";
	input.placeholder = `Message ${selected.name} directly…`;
	input.value = state.agentChatDrafts?.[selected.agentId] || "";
	input.disabled = state.agentChatBusy === true;
	input.addEventListener("input", () => actions.draft?.(input.value));
	input.addEventListener("keydown", event => {
		if ((event.ctrlKey || event.metaKey) && event.key === "Enter") {
			event.preventDefault();
			actions.send?.(input.value);
		}
	});
	return input;
}

function createSendButton(state, selected, input, actions) {
	const label = state.agentChatBusy ? "Sending…" : `Send to ${selected.name}`;
	const send = node("button", "primary", label);
	send.type = "button";
	send.disabled = state.agentChatBusy === true;
	send.addEventListener("click", () => actions.send?.(input.value));
	return send;
}

function createMessageRow(event) {
	const actor = event.actor || event.payload?.fromAgent || "room";
	const target = event.target || event.payload?.toAgent || "room";
	const body = event.payload?.body || event.title || event.type || "event";
	const row = node(
		"p",
		`awt-agent-direct-message is-${event.status || "observed"}`,
		`${actor} → ${target}: ${String(body)}`
	);
	row.title = event.at || "";
	return row;
}
