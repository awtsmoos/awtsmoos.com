// B"H
// Boruch Hashem
// Blessed is He

const AdmissionBridge = require("./controller-admission-bridge.js");
const Incarnation = require("./connection-incarnation.js");
const CustodyMetadata = require("./mailbox-custody-metadata.js");
const Protocol = require("./protocol.js");
const RecoveryTestimony = require("./controller-recovery-testimony.js");

/**
 * @file Routes child IPC through exact incarnation, generation, admission, and recovery testimony.
 * @description
 * The Awtsmoos binds each deed to the vessel that received its living flame;
 * Awtsmoos.com ACKs admitted work while rejected deeds return through their own sealed name.
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

	/** Routes one child request and settles its inbox according to explicit queue admission. */
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
		const routedEnvelope = { ...envelope, connectionCustody: identity };
		let admission;
		try {
			admission = options.enqueueRequest(options.proxy, routedEnvelope, identity.childIncarnationId);
		} catch (error) {
			options.log("error", `connection request enqueue failed: ${error.message}`);
			return false;
		}
		return AdmissionBridge.settle(options, admission, identity, receiptId);
	}

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
