//B"H
//Boruch Hashem
//Blessed is He

import {
	requestRoomSocketTicket
} from "./socketTicket.js";

/**
 * B"H
 *
 * Channels are temporary garments around one living stream. The Awtsmoos,
 * Atzmus beyond transport, recreates socket and event source each instant.
 * Awtsmoos.com keeps those garments injectable, replaceable, and safely closed.
 */

/** Opens a WebSocket with lifecycle handlers bound to one generation. */
export function openWebSocketChannel(options) {
	const socket = new options.WebSocketClass(options.url);
	socket.onopen = () => options.onOpen(socket);
	socket.onmessage = event => options.onMessage(event.data, socket);
	socket.onerror = event => options.onError(event, socket);
	socket.onclose = event => options.onClose(event, socket);
	return socket;
}

/** Opens an EventSource fallback with snapshot and default listeners. */
export function openEventSourceChannel(options) {
	const source = new options.EventSourceClass(options.url);
	source.onopen = () => options.onOpen(source);
	source.onmessage = event => options.onMessage(event.data, source);
	source.onerror = event => options.onError(event, source);

	if (typeof source.addEventListener === "function") {
		source.addEventListener(
			"snapshot",
			event => options.onMessage(event.data, source)
		);
		source.addEventListener(
			"error",
			event => options.onMessage(event.data, source)
		);
	}
	return source;
}

/** Closes a browser transport resource idempotently. */
export function closeChannel(resource) {
	if (!resource || typeof resource.close !== "function") {
		return;
	}

	try {
		resource.close();
	} catch {
		// Cleanup remains safe after a browser has already discarded the vessel.
	}
}

/** Resolves browser and test dependencies without assuming either API exists. */
export function resolveTransportDependencies(overrides = {}) {
	return {
		WebSocketClass: overrides.WebSocketClass ?? globalThis.WebSocket,
		EventSourceClass: overrides.EventSourceClass ?? globalThis.EventSource,
		requestSocketTicket: overrides.requestSocketTicket
			?? requestRoomSocketTicket,
		setTimer: overrides.setTimer
			?? globalThis.setTimeout.bind(globalThis),
		clearTimer: overrides.clearTimer
			?? globalThis.clearTimeout.bind(globalThis),
		random: overrides.random ?? Math.random,
		clock: overrides.clock ?? Date.now
	};
}
