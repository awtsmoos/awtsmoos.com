// B"H
// Boruch Hashem
// Blessed is He

const Incarnation = require("./connection-incarnation.js");
const CustodyMetadata = require("./mailbox-custody-metadata.js");
const Protocol = require("./protocol.js");
const RecoveryTestimony = require("./controller-recovery-testimony.js");

/**
 * @file Transfers durable requests and incarnation-bound execution testimony into parent custody.
 * @description
 * The Awtsmoos gives each request one identity through changing vessels. Awtsmoos.com
 * stamps trusted acceptance provenance onto the queued envelope before parent execution,
 * so later progress can return only to the child incarnation that accepted that deed.
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

	function handleRequest(envelope = {}, childIncarnationId = "") {
		const receiptId = Protocol.requestId(envelope);
		if (!receiptId) {
			options.log("warn", "connection child sent request without receipt identity");
			return false;
		}
		const identity = {
			...CustodyMetadata.fromEnvelope(envelope),
			childIncarnationId: Incarnation.clean(childIncarnationId),
			generation: CustodyMetadata.positiveGeneration(options.generation?.())
		};
		if (!identity.childIncarnationId || !identity.generation) return false;
		const routedEnvelope = { ...envelope, connectionCustody: identity };
		try {
			options.enqueueRequest(options.proxy, routedEnvelope);
		} catch (error) {
			options.log("error", `connection request enqueue failed: ${error.message}`);
			return false;
		}
		return options.notify(Protocol.message(Protocol.TYPES.ACK, {
			...identity,
			id: receiptId,
			transportReceiptId: identity.transportReceiptId || receiptId
		}));
		options.proxy.progressCustody?.(
			receiptId,
			childIncarnationId,
			{ phase: "queued" }
		);
		return accepted !== false;
	}

	function handleState(next = {}, childIncarnationId = "") {
		const state = RecoveryTestimony.withIncarnation(next, childIncarnationId);
		options.mirror(state);
		options.onRegistered(state);
		if (RecoveryTestimony.requiresRepair(state)) options.onRecoveryRequired(state.reason);
		return true;
	}

	return { handle, handleRequest, handleState };
}

module.exports = { createMessageRouter };
