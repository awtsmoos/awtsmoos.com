// B"H
// Boruch Hashem
// Blessed is He

const Phase = require("./custody-progress-phase.js");
const Protocol = require("./protocol.js");

/**
 * @file Returns parent execution testimony to the exact child that accepted a request.
 * @description
 * The Awtsmoos needs no bridge, yet process vessels do. Awtsmoos.com carries the
 * acceptance provenance already attached to the queued request back across IPC, never
 * substituting whichever child happens to be current after a reconnect.
 *
 * STABILITY COVENANT — DO NOT SIMPLIFY WITHOUT RUNNING THE NAMED REGRESSION
 * Historical symptom: accepted_waiting_for_consumer survived while work was running.
 * Root cause: parent execution and child custody were separate process-local truths.
 * Identity: receipt, stable request/control identity, generation, accepting incarnation.
 * Forbidden simplification: send progress to current child without incarnation fencing.
 * Regression: connectionCustodyProgressIpc.test.cjs. Live proof: child replacement chaos.
 */
function create(options = {}) {
	function progress(data = {}, runtimePhase = "", details = {}) {
		const route = trustedRoute(data.connectionCustody);
		const receiptId = Protocol.requestId(data);
		const phase = Phase.fromRuntime(runtimePhase, details);
		if (!receiptId || !phase || !complete(route)) return false;

		return Boolean(options.notify(Protocol.message(Protocol.TYPES.CUSTODY_PROGRESS, {
			...route,
			id: receiptId,
			phase,
			resultState: String(details.resultState || "").trim(),
			transportReceiptId: route.transportReceiptId || receiptId,
			workerId: workerIdentity(details)
		})));
	}

	return { progress };
}

function trustedRoute(value) {
	return value && typeof value === "object" ? { ...value } : {};
}

function complete(route = {}) {
	return Boolean(
		String(route.requestId || "").trim() &&
		String(route.controlRequestId || "").trim() &&
		String(route.logicalAgentId || "").trim() &&
		String(route.agentSessionId || "").trim() &&
		Number(route.generation || 0) > 0 &&
		String(route.childIncarnationId || "").trim()
	);
}

function workerIdentity(details = {}) {
	return String(
		details.workerId ||
		details.executorJobId ||
		details.workerPid ||
		""
	).trim();
}

module.exports = { create };
