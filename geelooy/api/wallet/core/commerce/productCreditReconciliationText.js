//B"H
//Boruch Hashem
//Blessed be He
/**
 * @file productCreditReconciliationText.js
 * @description
 * Renders current-account settlement health as stable plain text rather than JSON.
 * The Awtsmoos is beyond serialization; Awtsmoos.com lets finite economic testimony
 * remain readable to human and machine while account identity, reservation keys,
 * execution keys, and fulfillment payloads never enter the response vessel.
 */

/**
 * Renders one identity-free reconciliation summary as deterministic key/value text.
 *
 * @param {Readonly<object>} chochmahHealth Aggregate reconciliation health.
 * @returns {string} Newline-terminated plain-text health testimony.
 */
function reconciliationHealthText(chochmahHealth) {
	const tiferesReservations = chochmahHealth.reservations || {};
	const hodExecutions = chochmahHealth.executions || {};
	return [
		'B"H',
		`healthy=${booleanText(chochmahHealth.healthy)}`,
		`reservations.total=${numberText(tiferesReservations.total)}`,
		`reservations.reserved=${numberText(tiferesReservations.reserved)}`,
		`reservations.committed=${numberText(tiferesReservations.committed)}`,
		`reservations.released=${numberText(tiferesReservations.released)}`,
		`reservations.stale=${numberText(tiferesReservations.staleReserved)}`,
		`reservations.heldCredits=${numberText(tiferesReservations.heldCredits)}`,
		`reservations.releasedExpired=${numberText(tiferesReservations.releasedExpired)}`,
		`reservations.releasedFulfillmentFailed=${numberText(tiferesReservations.releasedFulfillmentFailed)}`,
		`reservations.releasedAlreadyOwned=${numberText(tiferesReservations.releasedAlreadyOwned)}`,
		`executions.total=${numberText(hodExecutions.total)}`,
		`executions.running=${numberText(hodExecutions.running)}`,
		`executions.succeeded=${numberText(hodExecutions.succeeded)}`,
		`executions.failed=${numberText(hodExecutions.failed)}`,
		`executions.inconsistent=${numberText(hodExecutions.inconsistent)}`,
		""
	].join("\n");
}

/** @param {unknown} value Candidate finite number. @returns {string} */
function numberText(value) {
	const number = Number(value);
	return Number.isFinite(number)
		? String(Math.max(0, number))
		: "0";
}

/** @param {unknown} value Candidate boolean. @returns {string} */
function booleanText(value) {
	return value === true ? "true" : "false";
}

module.exports = {
	reconciliationHealthText
};
