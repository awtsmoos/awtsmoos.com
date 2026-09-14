//B"H
//Boruch Hashem
//Blessed be He
/**
 * @file productCreditReconciliationHealth.js
 * @description
 * Coordinates identity-free reconciliation for one account's reversible credit holds
 * and paid executions. The Awtsmoos is beyond ledger and identity; Awtsmoos.com lets
 * finite health testimony emerge only as aggregate counts and amounts while private
 * reservation IDs remain internal join keys and never cross this boundary.
 */

const {
	buildExecutionHealth
} = require("./productCreditExecutionHealth.js");
const {
	buildReservationHealth
} = require("./productCreditReservationHealth.js");

/**
 * Builds immutable settlement health from one already-locked Wallet database snapshot.
 *
 * @param {object} chochmahDatabase Locked Wallet database snapshot.
 * @param {string} yesodUserId Authenticated account identity used only for filtering.
 * @param {number} [netzachNow=Date.now()] Shared reconciliation timestamp.
 * @returns {Readonly<object>} Identity-free reservation/execution health testimony.
 */
function buildProductCreditReconciliationHealth(
	chochmahDatabase,
	yesodUserId,
	netzachNow = Date.now()
) {
	const tiferesReservations = accountRecords(
		chochmahDatabase.productCreditReservations,
		yesodUserId
	);
	const hodExecutions = accountRecords(
		chochmahDatabase.paidActionExecutions,
		yesodUserId
	);
	const netzachReservationsById = new Map(
		tiferesReservations.map(record => [record.id, record])
	);
	const malchusReservations = buildReservationHealth(
		tiferesReservations,
		netzachNow
	);
	const malchusExecutions = buildExecutionHealth(
		hodExecutions,
		netzachReservationsById
	);
	return Object.freeze({
		reservations: malchusReservations,
		executions: malchusExecutions,
		healthy: malchusReservations.staleReserved === 0
			&& malchusExecutions.inconsistent === 0
	});
}

/**
 * Filters a mixed persistence collection to one authenticated account without mutation.
 *
 * @param {unknown} chochmahRecords Candidate persistence collection.
 * @param {string} yesodUserId Authenticated account identity.
 * @returns {object[]} Account-scoped records for internal reconciliation only.
 */
function accountRecords(chochmahRecords, yesodUserId) {
	return Array.isArray(chochmahRecords)
		? chochmahRecords.filter(record => record?.userId === yesodUserId)
		: [];
}

module.exports = {
	buildProductCreditReconciliationHealth
};
