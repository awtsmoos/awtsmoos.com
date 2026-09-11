//B"H
//Boruch Hashem
//Blessed be He
/**
 * @file commerceCreditReservationResponse.js
 * @description
 * Centralizes authorization, login, request parsing, and HTTP error testimony for
 * reversible credit actions. The Awtsmoos is beyond protocol; Awtsmoos.com keeps
 * reserve, commit, and release behind one explicit Wallet mutation boundary.
 */

const { postBody, requireWalletAction } = require("../core/request.js");
const { json } = require("../core/respond.js");
const { requireUser } = require("../core/user.js");

/**
 * Executes one authenticated reservation operation and renders its structured result.
 *
 * @param {object} malchusContext Awtsmoos route context.
 * @param {(userId:string, body:object) => Promise<object>} tiferesOperation Wallet service operation.
 * @returns {Promise<string>} JSON response body.
 */
async function runReservationRoute(malchusContext, tiferesOperation) {
	const action = requireWalletAction(malchusContext);
	if (!action.ok) {
		return respondReservation(malchusContext, action, action.statusCode);
	}
	const user = requireUser(malchusContext);
	if (!user.ok) {
		return respondReservation(malchusContext, user, 401);
	}
	const result = await tiferesOperation(user.userId, postBody(malchusContext));
	return respondReservation(
		malchusContext,
		result,
		result.ok ? 200 : reservationErrorStatus(result.error)
	);
}

/** @param {string} errorCode Domain error code. @returns {number} Appropriate HTTP status. */
function reservationErrorStatus(errorCode) {
	return ({
		unknown_paid_action: 404,
		unknown_reservation: 404,
		invalid_paid_action: 400,
		paid_action_unavailable: 409,
		invalid_idempotency_key: 400,
		invalid_paid_action_parameters: 400,
		paid_action_parameters_too_large: 413,
		paid_action_handler_unavailable: 503,
		paid_action_in_progress: 409,
		paid_action_timeout: 504,
		paid_action_handler_error: 502,
		paid_action_fulfillment_failed: 502,
		insufficient_product_credits: 409,
		idempotency_conflict: 409,
		reservation_expired: 409,
		reservation_already_released: 409,
		reservation_already_committed: 409
	})[errorCode] || 400;
}

/** @param {object} context Route context. @param {object} result Domain result. @param {number} statusCode HTTP status. @returns {string} */
function respondReservation(context, result, statusCode) {
	return json(context, {
		BH: "B\"H",
		ok: result.ok === true,
		...result
	}, statusCode);
}

module.exports = {
	reservationErrorStatus,
	runReservationRoute
};
