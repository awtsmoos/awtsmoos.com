//B"H
//Boruch Hashem
//Blessed is He

import {
	agentConversation,
	buildAgentChannels,
	ensureSelectedAgent
} from "./model.js";

/**
 * B"H
 * The Awtsmoos clothes invisible room events in readable vessels. Each agent
 * becomes a selectable flame, while Awtsmoos.com keeps the shared WebSocket
 * visible so the human can speak into any working channel without confusion.
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
		heading(state, channels),
		channelGrid(channels, selectedAgentId, actions),
		directPanel(state, channels, selectedAgentId, actions)
	);
}

function heading(state, channels) {
	const wrapper = node("div", "awt-agent-live-heading");
	wrapper.append(
		node("h3", "", "Live agent channels"),
		node(
			"span",
			`awt-agent-socket is-${state.socketMode || "idle"}`,
			`${socketLabel(state)} · ${channels.length} agent${channels.length === 1 ? "" : "s"}`
		)
	);
	return wrapper;
}

function channelGrid(channels, selectedAgentId, actions) {
	const grid = node("div", "awt-agent-channel-grid");
	if (!channels.length) {
		grid.append(node("p", "awt-agent-empty", "No agent events have arrived yet."));
		return grid;
	}
	for (const channel of channels) {
		const button = node(
			"button",
			channelClass(channel, selectedAgentId),
			""
		);
		button.type = "button";
		button.dataset.agentId = channel.agentId;
		button.addEventListener("click", () => actions.select?.(channel.agentId));
		button.append(
			node("span", "awt-agent-presence-dot", "●"),
			node("strong", "", channel.name),
			node("small", "", `${channel.role} · ${channel.connectionLabel}`),
			node("small", "", `${channel.activityCount} live event${channel.activityCount === 1 ? "" : "s"} · ${channel.lastType}`)
		);
		grid.append(button);
	}
	return grid;
}

function directPanel(state, channels, selectedAgentId, actions) {
	const selected = channels.find(channel => channel.agentId === selectedAgentId);
	const panel = node("section", "awt-agent-direct");
	if (!selected) {
		panel.append(node("p", "awt-agent-empty", "Select a room agent to open direct chat."));
		return panel;
	}
	const log = node("div", "awt-agent-direct-log");
	for (const event of agentConversation(state, selectedAgentId).slice(-8)) {
		log.append(messageRow(event));
	}
	if (!log.children.length) {
		log.append(node("p", "awt-agent-empty", "No direct conversation yet."));
	}
	const input = node("textarea", "awt-agent-direct-input");
	input.id = "roomAgentDirectMessage";
	input.placeholder = `Message ${selected.name} directly…`;
	input.disabled = state.agentChatBusy === true;
	input.addEventListener("keydown", event => {
		if ((event.ctrlKey || event.metaKey) && event.key === "Enter") {
			event.preventDefault();
			actions.send?.(input.value);
		}
	});
	const send = node("button", "primary", state.agentChatBusy ? "Sending…" : `Send to ${selected.name}`);
	send.type = "button";
	send.disabled = state.agentChatBusy === true;
	send.addEventListener("click", () => actions.send?.(input.value));
	panel.append(
		node("h4", "", `Direct chat · ${selected.name}`),
		node("p", "awt-agent-direct-note", "Messages use the room’s existing authenticated transport and mission action API."),
		log,
		input,
		send
	);
	if (state.agentChatError) panel.append(node("p", "awt-agent-chat-error", state.agentChatError));
	return panel;
}

function messageRow(event) {
	const actor = event.actor || event.payload?.fromAgent || "room";
	const target = event.target || event.payload?.toAgent || "room";
	const body = event.payload?.body || event.title || event.type || "event";
	return node("p", "awt-agent-direct-message", `${actor} → ${target}: ${body}`);
}

function node(tag, className = "", text = "") {
	const element = document.createElement(tag);
	if (className) element.className = className;
	if (text) element.textContent = text;
	return element;
}

function channelClass(channel, selectedAgentId) {
	return [
		"awt-agent-channel",
		channel.agentId === selectedAgentId ? "is-selected" : "",
		channel.isWorking ? "is-working" : "",
		channel.webSocketConnected ? "is-websocket" : ""
	].filter(Boolean).join(" ");
}

function socketLabel(state) {
	if (state.socketMode === "websocket") return "Room WebSocket live";
	if (state.socketMode === "eventsource") return "SSE fallback active";
	if (state.socketMode === "connecting") return "Room WebSocket connecting";
	return "Room live transport waiting";
}

function renderSignature(state, channels, selectedAgentId) {
	return JSON.stringify({
		selectedAgentId,
		socketMode: state.socketMode,
		busy: state.agentChatBusy,
		error: state.agentChatError,
		channels: channels.map(channel => [
			channel.agentId,
			channel.lastAt,
			channel.activityCount,
			channel.webSocketConnected
		])
	});
}
