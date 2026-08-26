// B"H
// Boruch Hashem
// Blessed is He

const CustodyMetadata = require("./mailbox-custody-metadata.js");
const Protocol = require("./protocol.js");

/**
 * @file Transfers one durable request from connection child to parent custody.
 * @description
 * The Awtsmoos joins persistence and execution without erasing the deed's true name.
 * Awtsmoos.com acknowledges only after parent admission and returns the same request,
 * transport, shliach, and session testimony so child custody remains generation-aware.
 */
function createMessageRouter(options = {}) {
	function handle(message) {
		if (!Protocol.valid(message)) return false;
		if (message.type === Protocol.TYPES.READY) return handleReady();
		if (message.type === Protocol.TYPES.REQUEST) return handleRequest(message.envelope);
		if (message.type === Protocol.TYPES.STATE) return handleState(message.state);
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

	/**
	 * Accepts execution custody and sends an identity-bearing acknowledgement to the child.
	 * @param {object} envelope Original durable relay request.
	 * @returns {boolean} True only when parent admission and child notification both occur.
	 */
	function handleRequest(envelope = {}) {
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
		const identity = CustodyMetadata.fromEnvelope(envelope);
		return options.notify(Protocol.message(Protocol.TYPES.ACK, {
			...identity,
			id: receiptId,
			transportReceiptId: identity.transportReceiptId || receiptId
		}));
	}

	function handleState(state = {}) {
		if (state.registered === true) options.onRegistered();
		options.mirror(state);
		options.publishStats();
		return true;
	}

	return { handle, handleRequest };
}

module.exports = { createMessageRouter };
