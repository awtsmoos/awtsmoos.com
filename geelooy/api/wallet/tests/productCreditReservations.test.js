//B"H
//Boruch Hashem
//Blessed be He
/**
 * @file productCreditReservations.test.js
 * @description
 * Proves reversible product-credit accounting before provider-backed adoption. The
 * Awtsmoos is beyond retry and race; Awtsmoos.com verifies that every finite hold,
 * commit, expiry, and release preserves account value exactly once.
 */

const test = require("node:test");
const assert = require("node:assert/strict");
const { ensureProductCredit } = require("../core/commerce/productCredits.js");
const { commitProductCreditReservation } = require("../core/commerce/productCreditReservationCommit.js");
const { releaseReservationRecord } = require("../core/commerce/productCreditReservationRelease.js");
const { reserveProductCredits } = require("../core/commerce/productCreditReservationReserve.js");
const { findReservation } = require("../core/commerce/productCreditReservationStore.js");

/** @returns {object} Fresh in-memory locked-database analogue with five Transcribe credits. */
function createDatabase() {
	const database = {};
	ensureProductCredit(database, "user-a", "transcribe", 1000).balance = 5;
	return database;
}

/** @param {string} key Stable test key. @param {number} [amount=2] Held units. @returns {object} */
function reservationInput(key, amount = 2) {
	return {
		productId: "transcribe",
		amount,
		purpose: "hosted_transcription",
		idempotencyKey: key
	};
}

test("reservation commits exactly once without a second balance debit", () => {
	const database = createDatabase();
	const first = reserveProductCredits(database, "user-a", reservationInput("reserve-001"), 2000);
	assert.equal(first.balance, 3);
	const commit = commitProductCreditReservation(database, "user-a", "reserve-001", 3000);
	const retry = commitProductCreditReservation(database, "user-a", "reserve-001", 4000);
	assert.equal(commit.ok, true);
	assert.equal(retry.deduplicated, true);
	assert.equal(ensureProductCredit(database, "user-a", "transcribe").balance, 3);
	assert.equal(ensureProductCredit(database, "user-a", "transcribe").lifetimeConsumed, 2);
});

test("release restores a hold exactly once and commit afterwards conflicts", () => {
	const database = createDatabase();
	reserveProductCredits(database, "user-a", reservationInput("reserve-002"), 2000);
	const record = findReservation(database, "user-a", "reserve-002");
	const release = releaseReservationRecord(database, record, "cancelled", 3000);
	assert.equal(release.balance, 5);
	const commit = commitProductCreditReservation(database, "user-a", "reserve-002", 4000);
	assert.equal(commit.error, "reservation_already_released");
	assert.equal(ensureProductCredit(database, "user-a", "transcribe").balance, 5);
});

test("reservation replay is stable and competing holds cannot overdraw", () => {
	const database = createDatabase();
	const first = reserveProductCredits(database, "user-a", reservationInput("reserve-003", 4), 2000);
	const replay = reserveProductCredits(database, "user-a", reservationInput("reserve-003", 4), 3000);
	const competing = reserveProductCredits(database, "user-a", reservationInput("reserve-004", 4), 3000);
	assert.equal(first.ok, true);
	assert.equal(replay.deduplicated, true);
	assert.equal(competing.error, "insufficient_product_credits");
	assert.equal(ensureProductCredit(database, "user-a", "transcribe").balance, 1);
});

test("expired reservation restores balance and cannot later commit", () => {
	const database = createDatabase();
	reserveProductCredits(database, "user-a", reservationInput("reserve-005"), 2000);
	const record = findReservation(database, "user-a", "reserve-005");
	const commit = commitProductCreditReservation(database, "user-a", "reserve-005", record.expiresAt + 1);
	assert.equal(commit.error, "reservation_expired");
	assert.equal(ensureProductCredit(database, "user-a", "transcribe").balance, 5);
});
