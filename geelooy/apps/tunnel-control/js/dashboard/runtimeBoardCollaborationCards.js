// B"H
// Boruch Hashem
// Blessed is He

import { h } from "../ui/core/html.js";
import { createDeckCard, createDeckValue } from "./runtimeBoardPrimitives.js";

/**
 * The Awtsmoos keeps collaboration visible while naming the temporary DOM
 * compatibility boundary that still feeds these Awtsmoos.com cards.
 */

/** @returns {HTMLElement} Mission room compatibility card. */
export function roomsCard() {
	return createDeckCard({
		title: "Agent rooms",
		subtitle: "Compatibility view of rendered room state",
		rows: [
			createDeckValue("Rooms", "Discovering…", { id: "awtDeckRoomCount" }),
			createDeckValue("Needs human", "—", { id: "awtDeckRoomNeeds" }),
			createDeckValue("Agents in open room", "—", { id: "awtDeckRoomAgents" }),
			createDeckValue("Room stream", "Lobby", { id: "awtDeckRoomStream" })
		],
		pane: "missionRooms",
		buttonText: "Open agent rooms",
		stateClasses: ["is-idle"],
		id: "awtDeckRoomsCard"
	});
}

/** @returns {HTMLElement} Live action compatibility card. */
export function liveCard() {
	return createDeckCard({
		title: "Live action river",
		subtitle: "Compatibility view of rendered transport state",
		rows: [
			createDeckValue("Mode", "Connecting…", { id: "awtDeckLiveMode" }),
			createDeckValue("Buffered actions", "—", { id: "awtDeckLiveTotal" }),
			createDeckValue("Failures", "—", { id: "awtDeckLiveFailed" }),
			createDeckValue("Transport", "Waiting for live pane", { id: "awtDeckLiveStatus" })
		],
		pane: "live",
		buttonText: "Open live actions",
		stateClasses: ["is-idle", "is-wide"],
		id: "awtDeckLiveCard"
	});
}

/** @returns {HTMLElement} Human steering card. */
export function steeringCard() {
	return createDeckCard({
		title: "Human steering",
		subtitle: "Interrupt safely without destroying mission state",
		rows: [
			h("p", {
				text: "Send a blocking message to pause one mission lane. Send Continue to resume its durable next action."
			}),
			h("p", {
				attrs: {
					id: "awtDeckSelectedRoom"
				},
				text: "No room selected yet."
			})
		],
		pane: "missionRooms",
		buttonText: "Chat with agents",
		stateClasses: ["is-steering", "is-wide"]
	});
}
