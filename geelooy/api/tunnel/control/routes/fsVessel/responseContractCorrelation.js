// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file Separates canonical deed identity from relay transport identity.
 * @description
 * The Awtsmoos keeps one deed recognizable through changing messengers. Awtsmoos.com
 * therefore validates an ordinary response by its deed identity, while a retry binds
 * the current relay receipt separately from the original durable deed.
 */

/**
 * Verifies control identity without weakening fail-closed response correlation.
 *
 * @param {string[]} errors Mutable mismatch ledger.
 * @param {object} payload Original or retry request payload.
 * @param {object} result Native tunnel response.
 * @param {Function} requireMatch Exact-match helper.
 * @returns {void}
 */
function verify(errors, payload = {}, result = {}, requireMatch) {
	if (String(payload.action || "") !== "retryAction") {
		requireMatch(
			errors,
			"controlRequestId",
			payload.controlRequestId,
			result.controlRequestId
		);
		return;
	}
	verifyRetry(errors, payload, result, requireMatch);
}

/**
 * Validates retry transport receipt and optional original deed independently.
 *
 * @param {string[]} errors Mutable mismatch ledger.
 * @param {object} payload Retry envelope.
 * @param {object} result Response for the durable original deed.
 * @param {Function} requireMatch Exact-match helper.
 * @returns {void}
 */
function verifyRetry(errors, payload, result, requireMatch) {
	const transportReceiptId = String(result.transportReceiptId || "").trim();
	const originalControlRequestId = originalControlId(payload);

	if (transportReceiptId) {
		requireMatch(
			errors,
			"transportReceiptId",
			payload.controlRequestId,
			transportReceiptId
		);
	} else {
		requireMatch(
			errors,
			"controlRequestId",
			originalControlRequestId || payload.controlRequestId,
			result.controlRequestId
		);
	}

	if (originalControlRequestId) {
		requireMatch(
			errors,
			"originalControlRequestId",
			originalControlRequestId,
			result.controlRequestId
		);
	}
}

/**
 * Returns an explicitly carried canonical deed ID, never an inferred relay ID.
 *
 * @param {object} payload Retry envelope.
 * @returns {string} Original control request ID or an empty string.
 */
function originalControlId(payload = {}) {
	return String(
		payload.originalControlRequestId ||
		payload.params?.originalControlRequestId ||
		payload.retryPayload?.originalControlRequestId ||
		""
	).trim();
}

module.exports = {
	originalControlId,
	verify,
	verifyRetry
};
