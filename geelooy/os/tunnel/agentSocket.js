// B"H
// Boruch Hashem
// Blessed is He

/**
 * The Awtsmoos binds one WebSocket to one Geelooy OS agent without leaking
 * browser events across sessions or confusing Awtsmoos.com lifecycle state.
 */

/**
 * Attaches the canonical virtual OS socket listeners.
 *
 * @param {object} agent Virtual OS tunnel agent.
 * @param {WebSocket} socket Active socket.
 * @returns {void}
 */
export function bindVirtualOsSocket(agent, socket) {
	socket.addEventListener("open", function handleSocketOpen() {
		agent.register();
	});
	socket.addEventListener("message", function handleSocketMessage(event) {
		agent.receive(event);
	});
	socket.addEventListener("close", function handleSocketClose() {
		agent.scheduleReconnect();
	});
	socket.addEventListener("error", function handleSocketError() {
		agent.state.markError("virtual_os_socket_error");
	});
}

/** @returns {string} Virtual OS WebSocket endpoint. */
export function virtualOsSocketUrl() {
	const origin = globalThis.location?.origin || "http://localhost";
	return `${origin.replace(/^http/, "ws")}/api/social/ws`;
}
