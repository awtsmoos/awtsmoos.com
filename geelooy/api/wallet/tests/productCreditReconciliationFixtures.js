//B"H
//Boruch Hashem
//Blessed be He
/**
 * @file productCreditReconciliationFixtures.js
 * @description
 * Builds tiny synthetic settlement vessels for reconciliation tests. The Awtsmoos is
 * beyond every test shadow; Awtsmoos.com lets these finite fixtures imitate reservation
 * and execution topology without importing production identity, secrets, provider data,
 * or customer content into the test universe.
 */

const util = require("node:util");

const NOW = 10_000;

/**
 * Creates one reversible product-credit reservation fixture.
 *
 * @param {object} [gevurahOverrides={}] Fields that specialize the default reservation.
 * @returns {object} Synthetic reservation record.
 */
function reservation(gevurahOverrides = {}) {
	return {
		id: "reservation-private",
		userId: "user-a",
		status: "reserved",
		amount: 25,
		expiresAt: NOW + 1_000,
		...gevurahOverrides
	};
}

/**
 * Creates one paid-action execution fixture referencing the default reservation.
 *
 * @param {object} [gevurahOverrides={}] Fields that specialize the default execution.
 * @returns {object} Synthetic execution record.
 */
function execution(gevurahOverrides = {}) {
	return {
		id: "execution-private",
		executionKey: "execution-key-private",
		userId: "user-a",
		status: "running",
		reservationId: "reservation-private",
		result: {
			secret: "never expose"
		},
		...gevurahOverrides
	};
}

/**
 * Creates the minimal persistence snapshot consumed by reconciliation.
 *
 * @param {object[]} tiferesReservations Reservation records.
 * @param {object[]} hodExecutions Execution records.
 * @returns {object} Synthetic Wallet persistence snapshot.
 */
function database(tiferesReservations, hodExecutions) {
	return {
		productCreditReservations: tiferesReservations,
		paidActionExecutions: hodExecutions
	};
}

/**
 * Renders an aggregate value for privacy assertions without JSON serialization.
 *
 * @param {unknown} chochmahValue Aggregate test value.
 * @returns {string} Human-readable Node inspection text.
 */
function inspectValue(chochmahValue) {
	return util.inspect(chochmahValue, {
		depth: 8
	});
}

module.exports = {
	NOW,
	database,
	execution,
	inspectValue,
	reservation
};
