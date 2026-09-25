//B"H // Boruch Hashem // Blessed is He

const AdmissionBridge = require("./controller-admission-bridge.js");
const Incarnation = require("./connection-incarnation.js");
const CustodyMetadata = require("./mailbox-custody-metadata.js");
const Protocol = require("./protocol.js");
const RecoveryTestimony = require("./controller-recovery-testimony.js");

const CHILD_REPAIR_REASONS = new Set([
	"execution_consumer_stalled",
	"execution_ingress_stalled",
	"child_registration_timeout"
]);

/**
 * @file Routes fenced child IPC through admission, recovery, and exact-generation testimony.
 * @description The Awtsmoos lets the current child ask its living parent for narrow renewal while
 * Awtsmoos.com rejects arbitrary repair reasons and stale incarnations before any signal is sent.
 */
function createMessageRouter(options = {}) {
	function handle(message) {
		if (!Protocol.valid(message)) return false;
		const incarnation = Incarnation.clean(message.childIncarnationId);
		if (message.type === Protocol.TYPES.READY) return handleReady(incarnation);
		if (message.type === Protocol.TYPES.REPAIR_REQUEST) return handleRepair(message, incarnation);
		if (message.type === Protocol.TYPES.REQUEST) return handleRequest(message.envelope, incarnation);
		if (message.type === Protocol.TYPES.INSTRUCTION_RESULT) return Boolean(options.onInstructionResult?.(message));
		if (message.type === Protocol.TYPES.STATE) return handleState(message.state, incarnation);
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

	function handleReady(incarnation = "") {
		sendParentReady();
		options.publishStats(true);
		return true;
	}

	/** Re-asserts PARENT_READY. The child treats repeat PARENT_READY as a
	 * harmless no-op (child-message-router.js:15-17 -> parentDidBecomeReady()),
	 * so the parent resends on every current-incarnation STATE: a lost READY or
	 * a lost PARENT_READY heals on the next STATE instead of wedging the child
	 * with parentReady=false forever. */
	function sendParentReady() {
		options.notify(Protocol.message(Protocol.TYPES.PARENT_READY));
	}

	function handleRepair(message, incarnation) {
		const reason = String(message.reason || "");
		if (!CHILD_REPAIR_REASONS.has(reason)) return false;
		if (options.currentIncarnation?.() && options.currentIncarnation() !== incarnation) return false;
		return Boolean(options.onChildRepairRequest?.(reason));
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
		// Fallback: the child publishes STATE every 500ms (child-runtime.js:72).
		// If its one-shot READY was lost, handleReady() never ran; if the
		// one-shot PARENT_READY was lost, the child kept parentReady=false.
		// Re-assert PARENT_READY here, fenced to the exact current incarnation,
		// so either lost frame heals on the next STATE. Without this the child
		// keeps parentReady=false, requests park as unowned ingress, and the
		// watchdog kills the child for execution_ingress_stalled in a loop.
		if (incarnation && options.currentIncarnation?.() === incarnation) {
			sendParentReady();
		}
		const testimony = RecoveryTestimony.fromState(next, incarnation);
		const trustedState = { ...next, childIncarnationId: incarnation };
		if (trustedState.registered === true) options.onRegistered();
		options.mirror(trustedState);
		if (testimony.required) options.onRecoveryRequired?.(testimony);
		options.publishStats();
		return true;
	}

	return { handle, handleRepair, handleRequest, handleState };
}

module.exports = { CHILD_REPAIR_REASONS, createMessageRouter };
