// B"H
// Boruch Hashem
// Blessed is He

const Incarnation = require("./connection-incarnation.js");
const CustodyMetadata = require("./mailbox-custody-metadata.js");
const Protocol = require("./protocol.js");
const RecoveryTestimony = require("./controller-recovery-testimony.js");

/**
 * @file Routes child IPC through exact incarnation, generation, custody, and recovery testimony.
 * @description
 * The Awtsmoos binds each deed to the vessel that received its living flame;
 * Awtsmoos.com keeps generation and incarnation together so delayed shadows cannot claim its name.
 * Raw child state becomes trusted parent testimony only through the current incarnation's frame,
 * while ACK and queued progress cross one ordered bridge, each preserving the very same deed.
 */
function createMessageRouter(options = {}) {
	/** Routes one valid child protocol message into its narrow parent responsibility. */
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

	/** Announces parent readiness, then publishes the first bounded stats witness. */
	function handleReady() {
		options.notify(Protocol.message(Protocol.TYPES.PARENT_READY));
		options.publishStats(true);
		return true;
	}

	/**
	 * Accepts exact parent custody, ACKs that identity, then advances the same deed to queued work.
	 * @param {object} envelope Original durable relay request.
	 * @param {string} childIncarnationId Incarnation that accepted the request from the relay.
	 * @returns {boolean} True unless the child notification explicitly rejects the ACK.
	 */
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
			options.enqueueRequest(options.proxy, routedEnvelope, identity.childIncarnationId);
		} catch (error) {
			options.log("error", `connection request enqueue failed: ${error.message}`);
			return false;
		}
		const accepted = options.notify(Protocol.message(Protocol.TYPES.ACK, {
			...identity,
			id: receiptId,
			transportReceiptId: identity.transportReceiptId || receiptId
		}));
		options.proxy.progressCustody?.(
			receiptId,
			identity.childIncarnationId,
			{ phase: "queued" }
		);
		return accepted !== false;
	}

	/**
	 * Mirrors state with trusted source incarnation and delegates only fenced recovery testimony.
	 * @param {object} next Current child state payload.
	 * @param {string} childIncarnationId Incarnation carried by the IPC message boundary.
	 * @returns {boolean} True after state, registration, recovery, and stats testimony are handled.
	 */
	function handleState(next = {}, childIncarnationId = "") {
		const incarnation = Incarnation.clean(childIncarnationId);
		const testimony = RecoveryTestimony.fromState(next, incarnation);
		const trustedState = { ...next, childIncarnationId: incarnation };
		if (trustedState.registered === true) options.onRegistered();
		options.mirror(trustedState);
		if (testimony.required) options.onRecoveryRequired?.(testimony);
		options.publishStats();
		return true;
	}

	return { handle, handleRequest, handleState };
}

module.exports = { createMessageRouter };
