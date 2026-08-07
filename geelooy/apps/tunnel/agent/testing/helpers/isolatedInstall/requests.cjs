// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file Gives isolated relay requests terminal truth plus failure-time queue evidence.
 * @description
 * The Awtsmoos does not let a timeout erase the state that caused it. Awtsmoos.com
 * asks the disposable child for one stats-bearing pong only after a terminal wait has
 * already failed, preserving normal timing while making a red gate diagnostically rich.
 */
function sendRequest(relay, id, payload, timeoutMs = 15000) {
	relay.send({ type: "TUNNEL_REQUEST", id, payload });
	return terminalResponse(relay, id, timeoutMs);
}

async function terminalResponse(relay, id, timeoutMs = 15000) {
	try {
		return await relay.waitFor(message => {
			return message.type === "TUNNEL_RESPONSE" && message.id === id;
		}, timeoutMs);
	} catch (error) {
		throw await diagnosticError(relay, id, error);
	}
}

async function diagnosticError(relay, id, cause) {
	let pong = null;
	try {
		pong = await sendPing(relay, 2500);
	} catch {}
	const error = new Error([
		`terminal_response_timeout:${id}`,
		cause?.message || String(cause),
		`diagnosticPong=${JSON.stringify(pong)}`
	].join("\n"));
	error.cause = cause;
	return error;
}

function sendPing(relay, timeoutMs = 5000) {
	const previous = relay.messages.filter(message => message.type === "TUNNEL_PONG").length;
	relay.send({ type: "TUNNEL_PING", includeStats: true });
	return relay.waitFor(() => {
		return relay.messages.filter(message => message.type === "TUNNEL_PONG").length > previous;
	}, timeoutMs).then(() => {
		return relay.messages.filter(message => message.type === "TUNNEL_PONG").at(-1);
	});
}

module.exports = {
	diagnosticError,
	sendPing,
	sendRequest,
	terminalResponse
};
