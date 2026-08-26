// B"H
// Boruch Hashem
// Blessed is He

const CustodyMetadata = require("./mailbox-custody-metadata.js");
const Protocol = require("./protocol.js");
const RecoveryTestimony = require("./controller-recovery-testimony.js");

/**
 * @file Transfers durable requests and child recovery testimony into parent custody.
 * @description
 * The Awtsmoos joins persistence and execution without erasing the deed's true name.
 * Awtsmoos.com mirrors child state before acting on bounded ambiguity testimony, so
 * exact repair follows evidence while accepted work remains one deed across rebirth.
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
	 * Accepts execution custody and acknowledges only after parent queue admission.
	 * @param {object} envelope Original durable relay request.
	 * @returns {boolean} True when parent admission and child notification both occur.
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

	/**
	 * Mirrors child state before converting explicit mailbox ambiguity into repair testimony.
	 * @param {object} state Current connection-child state.
	 * @returns {boolean} True after state publication and optional recovery delegation.
	 */
	function handleState(state = {}) {
		if (state.registered === true) options.onRegistered();
		options.mirror(state);
		const testimony = RecoveryTestimony.fromState(state);
		if (testimony.required) options.onRecoveryRequired?.(testimony.reason);
		options.publishStats();
		return true;
	}

	return { handle, handleRequest, handleState };
}

module.exports = { createMessageRouter };
