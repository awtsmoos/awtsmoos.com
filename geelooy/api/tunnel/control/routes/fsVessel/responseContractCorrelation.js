//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file Separates retry transport receipts from the original deed identity.
 * @description
 * A retry is an observer wrapped around an older request, not a second deed.
 * Awtsmoos.com therefore binds the observer to transport testimony while the
 * original control request keeps its own identity. The Awtsmoos renews every
 * instant without confusing vessel and light, so this contract never compares
 * a wrapper receipt as though it were the deed that the wrapper observes.
 *
 * > One watcher may follow what another began,
 * > Yet one deed stays one through the durable span;
 * > The Awtsmoos renews every vessel and plan,
 * > So transport and deed keep the names that they can.
 */

/**
 * Verifies correlation for ordinary and retry responses.
 * @param {string[]} errors Mutable mismatch testimony.
 * @param {object} payload Original control payload.
 * @param {object} result Returned tunnel response.
 * @param {Function} requireMatch Strict field matcher.
 * @returns {void}
 */
function verify(errors, payload = {}, result = {}, requireMatch) {
	if (String(payload.action || "") === "retryAction") {
		verifyRetry(errors, payload, result, requireMatch);
		return;
	}
	verifyOrdinary(errors, payload, result, requireMatch);
}

/**
 * Verifies a retry without inferring deed identity from its observer receipt.
 * @param {string[]} errors Mutable mismatch testimony.
 * @param {object} payload Retry payload carrying the observer transport receipt.
 * @param {object} result Pending or terminal response for the observed deed.
 * @param {Function} requireMatch Strict field matcher.
 * @returns {void}
 */
function verifyRetry(errors, payload, result, requireMatch) {
	const pending = result.pending === true || result.action === "tunnelRequestPending";
	const transportReceipt = retryTransportReceipt(result);

	if (transportReceipt) {
		requireMatch(errors, "transportReceiptId", payload.controlRequestId, transportReceipt);
	} else if (pending) {
		requireMatch(errors, "controlRequestId", payload.controlRequestId, result.controlRequestId);
	} else {
		requireMatch(errors, "transportReceiptId", payload.controlRequestId, "");
	}

	if (payload.originalControlRequestId) {
		requireMatch(
			errors,
			"originalControlRequestId",
			payload.originalControlRequestId,
			result.controlRequestId
		);
	}
}

/**
 * Resolves only fields that can testify to the retry wrapper transport receipt.
 * @param {object} result Tunnel response.
 * @returns {string} Canonical observer transport receipt when present.
 */
function retryTransportReceipt(result = {}) {
	return String(
		result.transportReceiptId ||
		result.requestSemantics?.controlRequestId ||
		result.id ||
		""
	);
}

/**
 * Preserves strict correlation for non-retry requests.
 * @param {string[]} errors Mutable mismatch testimony.
 * @param {object} payload Original control payload.
 * @param {object} result Returned tunnel response.
 * @param {Function} requireMatch Strict field matcher.
 * @returns {void}
 */
function verifyOrdinary(errors, payload, result, requireMatch) {
	requireMatch(errors, "controlRequestId", payload.controlRequestId, result.controlRequestId);
	requireMatch(errors, "agentSessionId", payload.agentSessionId, result.agentSessionId);
	requireMatch(errors, "logicalAgentId", payload.logicalAgentId, result.logicalAgentId);
}

module.exports = {
	retryTransportReceipt,
	verify,
	verifyOrdinary,
	verifyRetry
};
