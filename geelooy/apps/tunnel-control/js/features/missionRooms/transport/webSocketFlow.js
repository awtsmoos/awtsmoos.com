//B"H
//Boruch Hashem
//Blessed is He

import { openWebSocketChannel } from "./channels.js";
import { connectEventSource } from "./eventSourceFlow.js";
import { scheduleReconnect } from "./reconnect.js";
import { ticketedRoomSocketUrl } from "./socketTicket.js";
import {
	handleSocketMessage,
	handleSocketOpen,
	isActiveSocket
} from "./webSocketReadiness.js";

/**
 * B"H
 *
 * This vessel acquires permission, opens the channel, and recovers its closure.
 * The Awtsmoos recreates every attempt; Awtsmoos.com keeps readiness proof in a
 * separate vessel so construction can never masquerade as authenticated life.
 */

/** Opens a ticketed WebSocket without allowing stale generations to survive. */
export async function connectWebSocket(controller, generation) {
	const { state, dependencies } = controller;
	if (!dependencies.WebSocketClass) {
		fallback(controller, generation, "no-websocket");
		return;
	}

	const ticketResult = await requestTicket(controller);
	if (!controller.isCurrent(generation)) {
		return;
	}
	if (!ticketResult?.ok || !ticketResult.ticket) {
		controller.diagnostic("websocket-ticket-failed", {
			error: ticketResult?.error || "ticket_unavailable"
		});
		fallback(controller, generation, "websocket-ticket-failed");
		scheduleReconnect(controller, generation, connectWebSocket);
		return;
	}

	try {
		state.socket = createSocket(
			controller,
			generation,
			ticketResult.ticket
		);
		controller.diagnostic("websocket-created");
	} catch (error) {
		controller.diagnostic("websocket-constructor-failed", {
			message: error.message
		});
		fallback(controller, generation, "websocket-constructor-failed");
		scheduleReconnect(controller, generation, connectWebSocket);
	}
}

async function requestTicket(controller) {
	try {
		return await controller.dependencies.requestSocketTicket({
			tunnelName: controller.getTunnelName(),
			missionId: controller.state.selectedMissionId,
			resumeState: controller.resumeState()
		});
	} catch (error) {
		return {
			ok: false,
			error: error.message
		};
	}
}

function createSocket(controller, generation, ticket) {
	const { state, dependencies } = controller;
	let socket;

	socket = openWebSocketChannel({
		WebSocketClass: dependencies.WebSocketClass,
		url: ticketedRoomSocketUrl(
			controller.getTunnelName,
			state.selectedMissionId,
			controller.resumeState(),
			ticket
		),
		onOpen: () => handleSocketOpen(
			controller,
			generation,
			socket
		),
		onMessage: raw => handleSocketMessage(controller, generation, raw),
		onError: () => controller.diagnostic("websocket-error"),
		onClose: () => handleClose(controller, generation, socket)
	});

	return socket;
}

function handleClose(controller, generation, socket) {
	if (!isActiveSocket(controller, generation, socket)) {
		return;
	}
	controller.state.socket = null;
	controller.diagnostic("websocket-closed");
	fallback(controller, generation, "websocket-closed");
	scheduleReconnect(controller, generation, connectWebSocket);
}

function fallback(controller, generation, reason) {
	connectEventSource(controller, generation, reason, connectWebSocket);
}
