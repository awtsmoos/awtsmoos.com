// B"H
// Boruch Hashem
// Blessed is He

const Incarnation = require("./connection-incarnation.js");
const Protocol = require("./protocol.js");
/**
 * @file Presents a socket-shaped durable IPC doorway to the main agent.
 * @description
 * The Awtsmoos lets old queue code speak through a new vessel while results keep provenance.
 * Awtsmoos.com mirrors the exact child incarnation and stamps terminal outbox truth with it,
 * so a completed deed may survive transport rebirth without becoming anonymous health debt.
 */
function createProxy(options = {}) {
	const state = {
		childIncarnationId: "",
		closed: false,
		opened: false,
		registered: false
	};

	function durableSend(envelope) {
		const saved = options.mailbox.putOutbox(envelope, {
			childIncarnationId: state.childIncarnationId
		});
		options.notify(Protocol.message(Protocol.TYPES.FLUSH, {
			id: Protocol.requestId(saved)
		}));
		return { queued: !state.registered, sent: state.registered };
	}

	function sendJson(envelope) {
		return options.notify(Protocol.message(Protocol.TYPES.SEND, {
			envelope
		}));
	}
	function close() {
		state.closed = true;
		state.opened = false;
		state.registered = false;
		return options.notify(Protocol.message(Protocol.TYPES.STOP));
	}

	function update(next = {}) {
		if (Object.prototype.hasOwnProperty.call(next, "childIncarnationId")) {
			state.childIncarnationId = Incarnation.clean(next.childIncarnationId);
			options.mailbox.setCurrentIncarnation?.(state.childIncarnationId);
		}
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
