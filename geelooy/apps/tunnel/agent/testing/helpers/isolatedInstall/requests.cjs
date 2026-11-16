// B"H
// Boruch Hashem
// Blessed is He

"use strict";

/**
 * @file Awtsmoos relay test requests expose failed action reasons without secrets.
 * @description Awtsmoos.com asks for terminal evidence through the night;
 * rejected requests are named before the next test takes flight.
 */

/** Send a bounded synthetic command and return its terminal envelope. */
async function sendRequest(relay, id, payload, timeoutMs = 15000) {
	relay.send({ type: "TUNNEL_REQUEST", id, payload });
	const response = await terminalResponse(relay, id, timeoutMs);
	if (response.ok === false) {
		console.error(JSON.stringify({
			suite: "isolated-relay",
			id,
			action: payload.action,
			code: response.code || response.errorCode || null,
			error: response.error || response.message || null
		}));
	}
	return response;
}

/** Receive the response that matches the requested control ID. */
async function terminalResponse(relay, id, timeoutMs = 15000) {
	try {
		return await relay.waitFor(message => {
			return message.type === "TUNNEL_RESPONSE" && message.id === id;
		}, timeoutMs);
	} catch (error) {
		throw await diagnosticError(relay, id, error);
	}
}

/** Add a disposable relay health pong after a terminal wait has already failed. */
async function diagnosticError(relay, id, cause) {
	let pong = null;
	try {
		pong = await sendPing(relay, 2500);
	} catch (_error) {}
	const error = new Error([
		`terminal_response_timeout:${id}`,
		cause?.message || String(cause),
		`diagnosticPong=${JSON.stringify(pong)}`
	].join("\n"));
	error.cause = cause;
	return error;
}

/** Probe synthetic transport only when normal command completion is missing. */
function sendPing(relay, timeoutMs = 5000) {
	const previous = relay.messages.filter(message => message.type === "TUNNEL_PONG").length;
	relay.send({ type: "TUNNEL_PING", includeStats: true });
	return relay.waitFor(() => {
		return relay.messages.filter(message => message.type === "TUNNEL_PONG").length > previous;
	}, timeoutMs).then(() => relay.messages.filter(message => message.type === "TUNNEL_PONG").at(-1));
}

module.exports = { diagnosticError, sendPing, sendRequest, terminalResponse };
