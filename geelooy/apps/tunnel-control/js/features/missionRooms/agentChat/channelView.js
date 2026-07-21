//B"H
//Boruch Hashem
//Blessed is He

import { channelClass, node, socketLabel } from "./dom.js";

/**
 * B"H
 * The Awtsmoos turns unseen activity into a field of selectable flames.
 * Awtsmoos.com shows the human which agent is working, which authenticated
 * current carries its testimony, and where direct conversation may begin.
 */

/** Builds the heading that testifies to account and room transport health. */
export function createAgentHeading(state, channels) {
	const wrapper = node("div", "awt-agent-live-heading");
	wrapper.append(
		node("h3", "", "Live agent channels"),
		node(
			"span",
			`awt-agent-socket is-${connectionClass(state)}`,
			`${socketLabel(state)} · ${channels.length} agent${channels.length === 1 ? "" : "s"}`
		)
	);
	return wrapper;
}

/** Builds selectable cards for every agent revealed in the selected room. */
export function createAgentChannelGrid(channels, selectedAgentId, actions) {
	const grid = node("div", "awt-agent-channel-grid");
	if (!channels.length) {
		grid.append(node(
			"p",
			"awt-agent-empty",
			"No agent roster or live activity has arrived for this room yet."
		));
		return grid;
	}
	for (const channel of channels) {
		grid.append(createChannelCard(channel, selectedAgentId, actions));
	}
	return grid;
}

function createChannelCard(channel, selectedAgentId, actions) {
	const button = node(
		"button",
		channelClass(channel, selectedAgentId)
	);
	button.type = "button";
	button.dataset.agentId = channel.agentId;
	button.setAttribute("aria-pressed", String(channel.agentId === selectedAgentId));
	button.addEventListener("click", () => actions.select?.(channel.agentId));
	button.append(
		node("span", "awt-agent-presence-dot", "●"),
		node("strong", "", channel.name),
		node("small", "", `${channel.role} · ${channel.connectionLabel}`),
		node("small", "", activityLabel(channel))
	);
	return button;
}

function activityLabel(channel) {
	const events = `${channel.activityCount} live event${channel.activityCount === 1 ? "" : "s"}`;
	const failures = channel.failures
		? ` · ${channel.failures} failure${channel.failures === 1 ? "" : "s"}`
		: "";
	return `${events} · ${channel.lastType}${failures}`;
}

function connectionClass(state) {
	if (state.accountConnectionState === "connected") return "websocket";
	return state.socketMode || state.accountConnectionState || "idle";
}
