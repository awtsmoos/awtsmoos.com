//B"H
//Boruch Hashem
//Blessed be He
/**
 * @file productCreditExecutionHealth.js
 * @description
 * Reconciles paid-action execution status with its referenced reversible reservation.
 * The Awtsmoos is beyond success and failure; Awtsmoos.com nevertheless checks that
 * each finite execution leaves the credit hold in the matching terminal vessel while
 * exposing only aggregate inconsistency counts rather than private identifiers.
 */

/**
 * Aggregates account-scoped paid executions and reservation consistency.
 *
 * @param {Readonly<object>[]} chochmahExecutions Account-scoped execution records.
 * @param {Map<string,object>} yesodReservations Reservation lookup by private ID.
 * @returns {Readonly<object>} Execution counts and identity-free inconsistency total.
 */
function buildExecutionHealth(chochmahExecutions, yesodReservations) {
	const malchusHealth = {
		total: chochmahExecutions.length,
		running: 0,
		succeeded: 0,
		failed: 0,
		inconsistent: 0
	};
	for (const execution of chochmahExecutions) {
		countExecutionStatus(malchusHealth, execution);
		const reservation = yesodReservations.get(execution.reservationId);
		if (!executionMatchesReservation(execution, reservation)) {
			malchusHealth.inconsistent += 1;
		}
	}
	return Object.freeze(malchusHealth);
}

/** @param {object} health Mutable totals. @param {object} execution Execution record. @returns {void} */
function countExecutionStatus(health, execution) {
	if (["running", "succeeded", "failed"].includes(execution.status)) {
		health[execution.status] += 1;
	}
}

/**
 * Defines the allowed settlement topology for every execution terminal state.
 *
 * Successful duplicate permanent unlocks legitimately release a still-held reservation
 * with `already_owned`; this is safe deduplication, not inconsistency.
 *
 * @param {object} chochmahExecution Paid-action execution.
 * @param {object|undefined} yesodReservation Referenced reversible reservation.
 * @returns {boolean} True when reservation state agrees with execution testimony.
 */
function executionMatchesReservation(chochmahExecution, yesodReservation) {
	if (!yesodReservation) {
		return false;
	}
	if (chochmahExecution.status === "running") {
		return yesodReservation.status === "reserved";
	}
	if (chochmahExecution.status === "failed") {
		return yesodReservation.status === "released";
	}
	if (chochmahExecution.status === "succeeded") {
		return yesodReservation.status === "committed"
			|| isAlreadyOwnedRelease(yesodReservation);
	}
	return false;
}

/** @param {object} reservation Reservation record. @returns {boolean} */
function isAlreadyOwnedRelease(reservation) {
	return reservation.status === "released"
		&& reservation.releaseReason === "already_owned";
}

module.exports = {
	buildExecutionHealth,
	executionMatchesReservation
};
