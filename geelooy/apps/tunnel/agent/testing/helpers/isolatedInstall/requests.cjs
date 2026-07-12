// B"H

/** B"H — Progress and terminal receipts are never confused in the mock relay. */
function sendRequest(relay, id, payload, timeoutMs = 15000) {
	relay.send({ type: 'TUNNEL_REQUEST', id, payload });
	return terminalResponse(relay, id, timeoutMs);
}

function terminalResponse(relay, id, timeoutMs = 15000) {
	return relay.waitFor(message => {
		return message.type === 'TUNNEL_RESPONSE' && message.id === id;
	}, timeoutMs);
}

function sendPing(relay, timeoutMs = 5000) {
	const previous = relay.messages.filter(message => message.type === 'TUNNEL_PONG').length;
	relay.send({ type: 'TUNNEL_PING' });
	return relay.waitFor((_message) => {
		return relay.messages.filter(message => message.type === 'TUNNEL_PONG').length > previous;
	}, timeoutMs).then(() => relay.messages.filter(message => message.type === 'TUNNEL_PONG').at(-1));
}

module.exports = { sendPing, sendRequest, terminalResponse };
