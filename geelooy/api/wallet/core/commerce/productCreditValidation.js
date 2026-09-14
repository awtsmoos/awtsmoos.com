//B"H
//Boruch Hashem
//Blessed be He
/**
 * @file productCreditValidation.js
 * @description
 * Converts an untrusted browser action id into server-owned product, purpose, and
 * credit cost testimony before any Wallet lock opens. Client-supplied amounts,
 * products, and purposes are deliberately ignored so underpricing is impossible.
 */

const { getPaidAction } = require("./paidActionCatalog.js");
const { normalizeIdempotencyKey } = require("./purchaseValidation.js");

const ACTION_ID_PATTERN = /^[a-z0-9][a-z0-9._:-]{0,95}$/;

/**
 * Resolves one browser request to the exact server-known paid-action contract.
 *
 * @param {object} input Untrusted request body containing actionId and retry key.
 * @returns {object} Server-authoritative spend testimony or stable failure.
 */
function validateProductCreditSpend(input = {}) {
	const actionId = String(input.actionId || "").trim().toLowerCase();
	const idempotencyKey = normalizeIdempotencyKey(input.idempotencyKey);
	if (!ACTION_ID_PATTERN.test(actionId)) {
		return failure("invalid_paid_action");
	}
	const action = getPaidAction(actionId);
	if (!action) {
		return failure("unknown_paid_action");
	}
	if (!action.available) {
		return failure("paid_action_unavailable");
	}
	if (!idempotencyKey) {
		return failure("invalid_idempotency_key");
	}
	return {
		ok: true,
		actionId: action.id,
		productId: action.productId,
		amount: action.creditCost,
		purpose: action.purpose,
		idempotencyKey
	};
}

/** @param {string} error Stable error code. @returns {{ok:false,error:string}} */
function failure(error) {
	return { ok: false, error };
}

module.exports = {
	ACTION_ID_PATTERN,
	validateProductCreditSpend
};
