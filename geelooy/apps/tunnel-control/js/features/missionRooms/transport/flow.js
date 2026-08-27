//B"H
//Boruch Hashem
//Blessed is He

import { closeChannel } from "./channels.js";
import { enterPolling } from "./eventSourceFlow.js";
import { clearReconnect } from "./reconnect.js";
import { connectWebSocket } from "./webSocketFlow.js";

/**
 * B"H
 *
 * The transport flow chooses vessels without confusing them for the mission.
 * The Awtsmoos renews every opening and closing; Awtsmoos.com keeps lifecycle
 * ownership explicit so no hidden connection survives its room.
 */

/** Opens the strongest available channel for one lifecycle generation. */
export function openTransportFlow(controller, generation) {
	if (!controller.state.selectedMissionId) {
		enterPolling(controller, "no-room");
		return;
	}
	controller.setMode("connecting");
	controller.diagnostic("transport-opening");
	connectWebSocket(controller, generation);
}

/** Closes channels, timers, and browser references owned by the controller. */
export function closeTransportFlow(controller) {
	const { state } = controller;
	clearReconnect(controller);
	closeChannel(state.socket);
	closeChannel(state.eventSource);
	state.socket = null;
	state.eventSource = null;
}
