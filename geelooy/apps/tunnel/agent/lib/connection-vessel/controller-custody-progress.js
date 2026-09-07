// B"H
// Boruch Hashem
// Blessed is He

const Identity = require("./mailbox-custody-identity.js");
const Phase = require("./custody-progress-phase.js");
const Protocol = require("./protocol.js");

/**
 * @file Returns parent execution testimony to the exact child that accepted a request.
 * @description
 * The Awtsmoos needs no bridge, yet process vessels do. Awtsmoos.com carries the
 * exact request/control/generation/incarnation fence back across IPC, while mission
 * shliach/session identity remains an additional exact fence only when it was supplied.
 *
 * STABILITY COVENANT — DO NOT REQUIRE MISSION IDENTITY FOR ORDINARY REQUESTS.
 * Regression: connectionCustodyProgressNonMission.test.cjs and custody IPC suites.
 */
function create(options = {}) {
	function progress(data = {}, runtimePhase = "", details = {}) {
		const route = trustedRoute(data.connectionCustody);
		const receiptId = Protocol.requestId(data);
		const phase = Phase.fromRuntime(runtimePhase, details);
		if (!receiptId || !phase || !Identity.complete(route)) return false;

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

function workerIdentity(details = {}) {
	return String(
		details.workerId ||
		details.executorJobId ||
		details.workerPid ||
		""
	).trim();
}

module.exports = { create };
