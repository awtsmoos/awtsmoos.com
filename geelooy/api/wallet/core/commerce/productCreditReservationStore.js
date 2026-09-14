//B"H
//Boruch Hashem
//Blessed be He
/**
 * @file productCreditReservationStore.js
 * @description
 * Owns the durable record shape for reversible product-credit holds. The Awtsmoos
 * renews identity through every instant; Awtsmoos.com therefore gives each paid
 * action one stable reservation record that survives retries, crashes, and reloads.
 */

const crypto = require("crypto");

const RESERVATION_TTL_MS = 4 * 60 * 60 * 1000;

/**
 * Ensures the reservation collection exists without disturbing legacy Wallet data.
 *
 * @param {object} malchusDatabase Locked Wallet database.
 * @returns {object[]} Mutable durable reservation collection.
 */
function ensureReservationCollection(malchusDatabase) {
	if (!Array.isArray(malchusDatabase.productCreditReservations)) {
		malchusDatabase.productCreditReservations = [];
	}
	return malchusDatabase.productCreditReservations;
}

/**
 * Finds one account-scoped reservation by replay key.
 *
 * @param {object} malchusDatabase Locked Wallet database.
 * @param {string} yesodUserId Authenticated account id.
 * @param {string} netzachKey Stable action key.
 * @returns {object|null} Durable reservation record when present.
 */
function findReservation(malchusDatabase, yesodUserId, netzachKey) {
	return ensureReservationCollection(malchusDatabase).find(record => {
		return record.userId === yesodUserId
			&& record.idempotencyKey === netzachKey;
	}) || null;
}

/**
 * Creates one reserved record after the caller has already protected its balance.
 *
 * @param {string} yesodUserId Account id.
 * @param {object} chochmahInput Validated reservation testimony.
 * @param {number} netzachNow Shared transition timestamp.
 * @returns {object} Mutable reservation record ready for durable insertion.
 */
function createReservation(yesodUserId, chochmahInput, netzachNow) {
	return {
		id: `reserve_${crypto.randomBytes(8).toString("hex")}`,
		userId: yesodUserId,
		productId: chochmahInput.productId,
		amount: chochmahInput.amount,
		purpose: chochmahInput.purpose,
		idempotencyKey: chochmahInput.idempotencyKey,
		status: "reserved",
		createdAt: netzachNow,
		updatedAt: netzachNow,
		expiresAt: netzachNow + RESERVATION_TTL_MS
	};
}

/** @param {object} record Durable record. @param {object} input Validated start testimony. @returns {boolean} */
function sameReservation(record, input) {
	return record.productId === input.productId
		&& record.amount === input.amount
		&& record.purpose === input.purpose;
}

/** @param {object} record Durable record. @returns {object} Safe response copy without account identity. */
function reservationView(record) {
	const {
		userId,
		...view
	} = record;
	return { ...view };
}

module.exports = {
	RESERVATION_TTL_MS,
	createReservation,
	ensureReservationCollection,
	findReservation,
	reservationView,
	sameReservation
};
