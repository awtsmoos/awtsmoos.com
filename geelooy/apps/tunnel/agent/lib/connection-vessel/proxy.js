// B"H
// Boruch Hashem
// Blessed is He

const Incarnation = require("./connection-incarnation.js");
const Protocol = require("./protocol.js");

/**
 * @file Presents a socket-shaped durable IPC doorway plus exact child-custody progress testimony.
 * @description
 * The Awtsmoos lets execution speak through one supervised child while identities stay bright;
 * Awtsmoos.com fences progress to that living incarnation, never to an older night.
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
		return options.notify(Protocol.message(Protocol.TYPES.SEND, { envelope }));
	}

	/** Sends progress only to the exact child incarnation that accepted this request. */
	function progressCustody(receiptId, acceptingIncarnationId, metadata = {}) {
		const accepting = Incarnation.clean(acceptingIncarnationId);
		if (!accepting || !Incarnation.matches(state.childIncarnationId, accepting)) return false;
		return options.notify(Protocol.message(Protocol.TYPES.PROGRESS, {
			childIncarnationId: accepting,
			id: String(receiptId || ""),
			metadata
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
		progressCustody,
		sendJson,
		snapshot,
		update
	};
}

module.exports = { createProxy };
