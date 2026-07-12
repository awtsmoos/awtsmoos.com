// B"H

import { h } from "../ui/core/html.js";
import { activatePane } from "../router/paneRouter.js";

export function deckHeader() {
	return h("header", {
		classes: ["awt-command-deck-head"],
		children: [
			h("div", { children: [
				h("p", { classes: ["awt-mini-kicker"], text: "LIVE AGENT FABRIC" }),
				h("h3", { attrs: { id: "awtAgentDeckTitle" }, text: "Every agent, room, and action in one truthful view." })
			] }),
			h("p", { text: "The overview reads Mission Rooms and Live Actions directly. Empty means empty; disconnected means disconnected." })
		]
	});
}

export function tunnelCard(ctx = {}) {
	const tunnel = ctx.runtime?.tunnel || {};
	const name = tunnel.name || ctx.getTunnelName?.() || "No tunnel selected";
	const root = ctx.runtime?.activeRoot || tunnel.root || "No project root reported";
	const access = [tunnel.allowWrite ? "write" : "read-only", tunnel.allowCommands ? "commands" : "no commands"].join(" · ");
	return deckCard("Tunnel vessel", "Connected runtime identity", [
		value("Name", name),
		value("Project", root, true),
		value("Access", access)
	], "setup", "Inspect tunnel", "is-connected");
}

export function roomsCard() {
	return deckCard("Agent rooms", "Durable collaboration and human gates", [
		value("Rooms", "Discovering…", false, "awtDeckRoomCount"),
		value("Needs human", "—", false, "awtDeckRoomNeeds"),
		value("Agents in open room", "—", false, "awtDeckRoomAgents"),
		value("Room stream", "Lobby", false, "awtDeckRoomStream")
	], "missionRooms", "Open agent rooms", "is-idle", "awtDeckRoomsCard");
}

export function liveCard() {
	return deckCard("Live action river", "WebSocket, EventSource, or polling truth", [
		value("Mode", "Connecting…", false, "awtDeckLiveMode"),
		value("Buffered actions", "—", false, "awtDeckLiveTotal"),
		value("Failures", "—", false, "awtDeckLiveFailed"),
		value("Transport", "Waiting for live pane", false, "awtDeckLiveStatus")
	], "live", "Open live actions", "is-idle", "awtDeckLiveCard");
}

export function steeringCard() {
	return deckCard("Human steering", "Interrupt safely without destroying mission state", [
		h("p", { text: "Send a blocking message to pause one mission lane. Send Continue to resume its durable next action." }),
		h("p", { attrs: { id: "awtDeckSelectedRoom" }, text: "No room selected yet." })
	], "missionRooms", "Chat with agents", "is-steering");
}

function deckCard(title, subtitle, rows, pane, buttonText, stateClass, id = "") {
	const button = h("button", { classes: ["awt-deck-open"], attrs: { type: "button" }, text: buttonText });
	button.addEventListener("click", () => activatePane(pane));
	return h("article", {
		classes: ["awt-command-deck-card", stateClass],
		attrs: id ? { id } : {},
		children: [
			h("div", { classes: ["awt-deck-card-head"], children: [h("h4", { text: title }), h("span", { text: subtitle })] }),
			h("div", { classes: ["awt-deck-values"], children: rows }),
			button
		]
	});
}

function value(label, text, code = false, id = "") {
	return h("div", { classes: ["awt-deck-value"], children: [
		h("span", { text: label }),
		h(code ? "code" : "strong", { attrs: id ? { id } : {}, text })
	] });
}
