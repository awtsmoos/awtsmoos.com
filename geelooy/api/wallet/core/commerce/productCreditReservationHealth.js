//B"H
//Boruch Hashem
//Blessed be He
/**
 * @file productCreditReservationHealth.js
 * @description
 * Aggregates reversible product-credit holds into identity-free health testimony.
 * The Awtsmoos is beyond every hold and release; Awtsmoos.com lets finite operators
 * see protected, stale, committed, and safely restored value without revealing which
 * account action, reservation key, or private fulfillment produced those totals.
 */

/**
 * Summarizes one account-scoped reservation collection.
 *
 * @param {Readonly<object>[]} chochmahReservations Account-only reservation records.
 * @param {number} netzachNow Shared reconciliation timestamp.
 * @returns {Readonly<object>} Aggregate reservation counts and held credit amount.
 */
function buildReservationHealth(chochmahReservations, netzachNow) {
	const malchusHealth = {
		total: chochmahReservations.length,
		reserved: 0,
		committed: 0,
		released: 0,
		staleReserved: 0,
		heldCredits: 0,
		releasedExpired: 0,
		releasedFulfillmentFailed: 0,
		releasedAlreadyOwned: 0
	};
	for (const record of chochmahReservations) {
		countStatus(malchusHealth, record);
		countReservedValue(malchusHealth, record, netzachNow);
		countReleaseReason(malchusHealth, record);
	}
	return Object.freeze(malchusHealth);
}

/** @param {object} health Mutable totals. @param {object} record Reservation record. @returns {void} */
function countStatus(health, record) {
	if (["reserved", "committed", "released"].includes(record.status)) {
		health[record.status] += 1;
	}
}

/** @param {object} health Mutable totals. @param {object} record Reservation record. @param {number} now Timestamp. @returns {void} */
function countReservedValue(health, record, now) {
	if (record.status !== "reserved") {
		return;
	}
	health.heldCredits += finiteAmount(record.amount);
	if (Number(record.expiresAt) <= now) {
		health.staleReserved += 1;
	}
}

/** @param {object} health Mutable totals. @param {object} record Reservation record. @returns {void} */
function countReleaseReason(health, record) {
	if (record.status !== "released") {
		return;
	}
	const tiferesField = ({
		expired: "releasedExpired",
		fulfillment_failed: "releasedFulfillmentFailed",
		already_owned: "releasedAlreadyOwned"
	})[record.releaseReason];
	if (tiferesField) {
		health[tiferesField] += 1;
	}
}

/** @param {unknown} value Candidate credit amount. @returns {number} */
function finiteAmount(value) {
	const amount = Number(value);
	return Number.isFinite(amount)
		? Math.max(0, amount)
		: 0;
}

module.exports = {
	buildReservationHealth
};
