// B"H
// Boruch Hashem
// Blessed is He

const Incarnation = require("./connection-incarnation.js");
const CustodyMetadata = require("./mailbox-custody-metadata.js");
const Protocol = require("./protocol.js");
const RecoveryTestimony = require("./controller-recovery-testimony.js");
/**
 * @file Transfers durable requests and incarnation-bound recovery testimony into parent custody.
 * @description
 * The Awtsmoos joins persistence and execution without erasing the deed's true vessel.
 * Awtsmoos.com mirrors trusted child identity before acting on ambiguity testimony, so
 * accepted work survives rebirth while an obsolete child's warning cannot kill its successor.
 */
function createMessageRouter(options = {}) {
	function handle(message) {
		if (!Protocol.valid(message)) return false;
		const childIncarnationId = Incarnation.clean(message.childIncarnationId);
		if (message.type === Protocol.TYPES.READY) return handleReady();
		if (message.type === Protocol.TYPES.REQUEST) {
			return handleRequest(message.envelope, childIncarnationId);
		}
		if (message.type === Protocol.TYPES.STATE) {
			return handleState(message.state, childIncarnationId);
		}
		if (message.type === Protocol.TYPES.TERMINAL) {
			options.onTerminal(message);
			return true;
		}
		if (message.type === Protocol.TYPES.LOG) {
			options.log(message.level || "info", message.message || "connection child event");
			return true;
		}
		return false;
	}

	function handleReady() {
		options.notify(Protocol.message(Protocol.TYPES.PARENT_READY));
		options.publishStats(true);
		return true;
	}

	/** Accepts parent execution custody and ACKs with trusted child-incarnation identity. */
	function handleRequest(envelope = {}, childIncarnationId = "") {
		const receiptId = Protocol.requestId(envelope);
		if (!receiptId) {
			options.log("warn", "connection child request omitted a transport receipt id");
			return false;
		}
		try {
			options.enqueueRequest(options.proxy, envelope);
		} catch (error) {
			options.log("warn", `parent queue rejected custody: ${error.message}`);
			return false;
		}
		const identity = {
			...CustodyMetadata.fromEnvelope(envelope),
			childIncarnationId: Incarnation.clean(childIncarnationId)
		};
		return options.notify(Protocol.message(Protocol.TYPES.ACK, {
			...identity,
			id: receiptId,
			transportReceiptId: identity.transportReceiptId || receiptId
		}));
	}

	/** Mirrors trusted state before delegating only current-incarnation repair testimony. */
	function handleState(state = {}, childIncarnationId = "") {
		const incarnation = Incarnation.clean(childIncarnationId);
		const testimony = RecoveryTestimony.fromState(state, incarnation);
		const trustedState = { ...state, childIncarnationId: incarnation };
		if (trustedState.registered === true) options.onRegistered();
		options.mirror(trustedState);
		if (testimony.required) options.onRecoveryRequired?.(testimony);
		options.publishStats();
		return true;
	}

	return { handle, handleRequest, handleState };
}

module.exports = { createMessageRouter };
