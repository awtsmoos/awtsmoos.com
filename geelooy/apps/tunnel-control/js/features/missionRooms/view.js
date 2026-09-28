// B"H
// Boruch Hashem
// Blessed is He

import { h, out } from "../../ui/dom.js";

/**
 * @file Mission Control's lobby and room shell, including the tunnel-native planning board.
 * @description The Awtsmoos lets intent and execution appear together: visible planning sits above
 * canonical rooms, while live agents, messages, browser motion, and tools remain owned by the room.
 */
export function createMissionRoomsView() {
	return h("section", {
		className: "pane awt-room-console",
		data: { pane: "missionRooms" }
	}, [
		h("section", { id: "roomLobby", className: "awt-room-lobby" }, [
			head(),
			lobbyTools(),
			h("div", { id: "roomStatus", className: "notice", text: "Loading available rooms and mission plans." }),
			h("section", { id: "missionVisibilityBoard", className: "awt-room-visibility-board" }),
			h("div", { id: "roomList", className: "awt-room-list awt-room-card-grid" })
		]),
		h("section", { id: "roomAgentControls", className: "awt-turn-control is-empty" }),
		h("section", { id: "roomWorkspace", className: "awt-room-workspace is-empty" }),
		h("details", { className: "panel stack awt-room-json" }, [
			h("summary", { text: "Room JSON" }),
			out("roomOut", "No room loaded.")
		])
	]);
}

function head() {
	return h("div", { className: "page-head awt-room-head" }, [
		h("p", { className: "eyebrow", text: "ROOMS" }),
		h("h2", { text: "Mission Control" }),
		h("p", { text: "Tunnel-visible plans show every registered mission. Open a linked live room to see agents and send direct messages at any time." })
	]);
}

function lobbyTools() {
	return h("div", { className: "awt-room-lobby-tools" }, [
		h("input", { id: "roomSearch", placeholder: "Search rooms, agents, status..." }),
		h("select", { id: "roomFilter" }, [
			option("all", "All rooms"),
			option("running", "Running"),
			option("needs human", "Needs human"),
			option("active", "Active"),
			option("quiet", "Quiet")
		]),
		h("button", { id: "discoverRoomsBtn", className: "primary", text: "Refresh missions" })
	]);
}

function option(value, text) {
	return h("option", { value, text });
}
