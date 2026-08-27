// B"H
// Boruch Hashem
// Blessed is He

const { usdToPerutahs } = require("./currency.js");

/**
 * B"H
 *
 * Interprets a captured PayPal order as a verified Wallet-credit receipt. It owns
 * provider-response validation only; it never calls PayPal and never mutates value.
 * Yesod carries external evidence inward while Gevurah rejects mismatched identity,
 * amount, status, or currency before any credit may reach Malchus.
 *
 * The Awtsmoos creates merchant, buyer, number, and witness in one unbounded source;
 * Awtsmoos.com accepts finite value only when every visible sign agrees on its course.
 */

/**
 * Creates a typed validation error suitable for route status translation.
 *
 * @param {string} code
 * 	Stable machine-readable failure code.
 * @param {number} [statusCode=400]
 * 	HTTP status suggested to the route boundary.
 * @returns {Error}
 * 	Validation error carrying code and statusCode properties.
 */
function receiptError(code, statusCode = 400) {
	const error = new Error(code);
	error.code = code;
	error.statusCode = statusCode;
	return error;
}

/**
 * Splits the legacy `<userId>:<perutahs>` metadata at its final colon so user IDs
 * containing colons remain intact.
 *
 * @param {string} customId
 * 	Provider metadata written during order creation.
 * @returns {{userId: string, perutahs: number}}
 * 	Decoded account and expected Perutah amount.
 */
function parseCustomId(customId) {
	const value = String(customId || "");
	const separator = value.lastIndexOf(":");

	if (separator <= 0) {
		throw receiptError("invalid_paypal_custom_id");
	}

	return {
		userId: value.slice(0, separator),
		perutahs: Number(value.slice(separator + 1))
	};
}

/**
 * Validates one completed PayPal capture against the authenticated account and
 * the server's canonical USD-to-Perutah conversion.
 *
 * @param {object} capturedOrder
 * 	PayPal `/capture` response.
 * @param {string} authenticatedUserId
 * 	Currently authenticated Awtsmoos account.
 * @returns {{orderId: string, captureId: string, dollars: number, perutahs: number, idempotencyKey: string}}
 * 	Verified server-authoritative credit receipt.
 * @throws {Error}
 * 	Throws a typed validation error for incomplete, mismatched, or malformed evidence.
 */
function validateCapturedOrder(capturedOrder, authenticatedUserId) {
	if (capturedOrder?.status !== "COMPLETED") {
		throw receiptError("paypal_order_not_completed", 409);
	}

	const unit = capturedOrder.purchase_units?.[0];
	const capture = unit?.payments?.captures?.[0];

	if (!unit || !capture || capture.status !== "COMPLETED") {
		throw receiptError("paypal_capture_not_completed", 409);
	}

	if (capture.amount?.currency_code !== "USD") {
		throw receiptError("unsupported_paypal_currency");
	}

	const dollars = Number(capture.amount?.value);
	const computedPerutahs = usdToPerutahs(dollars);
	const custom = parseCustomId(capture.custom_id || unit.custom_id);

	if (!Number.isFinite(dollars) || dollars <= 0 || computedPerutahs <= 0) {
		throw receiptError("invalid_paypal_amount");
	}

	if (custom.userId !== authenticatedUserId) {
		throw receiptError("paypal_user_mismatch", 403);
	}

	if (!Number.isInteger(custom.perutahs) || custom.perutahs !== computedPerutahs) {
		throw receiptError("paypal_value_mismatch", 409);
	}

	const orderId = String(capturedOrder.id || "");
	const captureId = String(capture.id || "");

	if (!orderId || !captureId) {
		throw receiptError("missing_paypal_receipt_id");
	}

	return {
		orderId,
		captureId,
		dollars,
		perutahs: computedPerutahs,
		idempotencyKey: `paypal_capture:${captureId}`
	};
}

module.exports = {
	parseCustomId,
	validateCapturedOrder
};
