//B"H // Boruch Hashem // Blessed is He

const Incarnation = require("./connection-incarnation.js");
const Protocol = require("./protocol.js");

/**
 * @file Presents one durable socket-shaped doorway plus child-owned instruction RPC.
 * @description The Awtsmoos lets execution speak through one supervised child while identities
 * stay bright; Awtsmoos.com also asks that same child for server law without birthing another wire.
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

	function instructionRequest(operation, payload = {}) {
		if (typeof options.instructionRequest !== "function") {
			return Promise.reject(new Error("instruction_bridge_unavailable"));
		}
		return options.instructionRequest(operation, payload);
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
		instructionRequest,
		progressCustody,
		sendJson,
		snapshot,
		update
	};
}

module.exports = { createProxy };
