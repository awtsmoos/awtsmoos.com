//B"H
//Boruch Hashem
//Blessed is He

import { roomStreamUrl } from "../api.js";
import { closeChannel, openEventSourceChannel } from "./channels.js";
import { scheduleReconnect } from "./reconnect.js";

/**
 * B"H
 *
 * EventSource is a second vessel, not a false promise of WebSocket parity. The
 * Awtsmoos renews each streamed snapshot, and Awtsmoos.com marks the fallback
 * plainly while preserving a path toward stronger reconnection.
 */

/** Opens or preserves the EventSource fallback for one active generation. */
export function connectEventSource(
	controller,
	generation,
	reason,
	reconnect
) {
	const { state, dependencies } = controller;
	if (state.eventSource) {
		controller.setMode("eventsource", reason);
		return;
	}
	if (!dependencies.EventSourceClass) {
		enterPolling(controller, reason || "no-eventsource");
		return;
	}

	try {
		const source = openEventSourceChannel({
			EventSourceClass: dependencies.EventSourceClass,
			url: roomStreamUrl(
				controller.getTunnelName,
				state.selectedMissionId,
				controller.resumeState()
			),
			onOpen: () => handleOpen(controller, generation, source, reason),
			onMessage: raw => handleMessage(controller, generation, raw),
			onError: () => handleError(
				controller,
				generation,
				source,
				reconnect
			)
		});
		state.eventSource = source;
		controller.setMode("eventsource", reason);
		controller.diagnostic("eventsource-created", { reason });
	} catch (error) {
		controller.diagnostic("eventsource-constructor-failed", {
			message: error.message
		});
		enterPolling(controller, "eventsource-constructor-failed");
	}
}

/** Moves the room into explicit polling mode without reporting false success. */
export function enterPolling(controller, reason) {
	controller.setMode("fallback-poll", reason || "transport-unavailable");
	controller.diagnostic("polling-fallback", { reason });
}

function handleOpen(controller, generation, source, reason) {
	if (!controller.isCurrent(generation)
		|| controller.state.eventSource !== source) {
		closeChannel(source);
		return;
	}
	controller.setMode("eventsource", reason || "websocket-fallback");
	controller.diagnostic("eventsource-open", { reason });
}

function handleMessage(controller, generation, raw) {
	if (controller.isCurrent(generation)) {
		controller.handleRaw(raw);
	}
}

function handleError(controller, generation, source, reconnect) {
	if (!controller.isCurrent(generation)
		|| controller.state.eventSource !== source) {
		return;
	}
	controller.state.eventSource = null;
	closeChannel(source);
	controller.diagnostic("eventsource-error");
	enterPolling(controller, "eventsource-error");
	scheduleReconnect(controller, generation, reconnect);
}
