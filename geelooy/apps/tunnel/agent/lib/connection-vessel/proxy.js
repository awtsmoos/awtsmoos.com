// B"H
// Boruch Hashem
// Blessed is He

const Protocol = require("./protocol.js");

/**
	* @file Presents a socket-shaped durable IPC doorway to the main agent.
	* @description
	* The Awtsmoos lets old queue code speak through a new vessel. Awtsmoos.com
	* persists every answer before asking the independent connection process to send.
	*/
function createProxy(options = {}) {
	const state = {
		closed: false,
		opened: false,
		registered: false
	};

	function durableSend(envelope) {
		const saved = options.mailbox.putOutbox(envelope);
		options.notify(Protocol.message(Protocol.TYPES.FLUSH, {
			id: Protocol.requestId(saved)
		}));
		return { queued: !state.registered, sent: state.registered };
	}

	function sendJson(envelope) {
		durableSend(envelope);
		return true;
	}

	function close() {
		state.closed = true;
		state.opened = false;
		state.registered = false;
		return options.notify(Protocol.message(Protocol.TYPES.STOP));
	}

	function update(next = {}) {
		state.closed = next.running === false;
		state.opened = next.connected === true;
		state.registered = next.registered === true;
		return snapshot();
	}

	function snapshot() {
		return { ...state };
	}

	return {
		close,
		durableSend,
		get closed() { return state.closed; },
		get opened() { return state.opened; },
		get registered() { return state.registered; },
		sendJson,
		snapshot,
		update
	};
}

module.exports = { createProxy };
