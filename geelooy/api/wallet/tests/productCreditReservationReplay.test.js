//B"H
//Boruch Hashem
//Blessed be He
/**
 * @file productCreditReservationReplay.test.js
 * @description
 * Attacks replay edges that can otherwise resurrect dead paid actions. The Awtsmoos
 * is beyond sequence; Awtsmoos.com still requires every finite action key to retain
 * one irreversible history once its hold is committed, cancelled, or expired.
 */

const test = require("node:test");
const assert = require("node:assert/strict");
const { ensureProductCredit } = require("../core/commerce/productCredits.js");
const { commitProductCreditReservation } = require("../core/commerce/productCreditReservationCommit.js");
const { releaseReservationRecord } = require("../core/commerce/productCreditReservationRelease.js");
const { reserveProductCredits } = require("../core/commerce/productCreditReservationReserve.js");
const { findReservation } = require("../core/commerce/productCreditReservationStore.js");

/** @returns {object} Five-credit isolated Wallet state. */
function createDatabase() {
	const database = {};
	ensureProductCredit(database, "replay-user", "transcribe", 1000).balance = 5;
	return database;
}

/** @param {string} key Replay key. @returns {object} Stable reservation testimony. */
function reservationInput(key) {
	return {
		productId: "transcribe",
		amount: 2,
		purpose: "hosted_transcription",
		idempotencyKey: key
	};
}

test("committed reserve replay returns committed testimony without another debit", () => {
	const database = createDatabase();
	const input = reservationInput("replay-committed");
	reserveProductCredits(database, "replay-user", input, 2000);
	commitProductCreditReservation(database, "replay-user", input.idempotencyKey, 3000);
	const replay = reserveProductCredits(database, "replay-user", input, 4000);
	assert.equal(replay.ok, true);
	assert.equal(replay.deduplicated, true);
	assert.equal(replay.reservation.status, "committed");
	assert.equal(ensureProductCredit(database, "replay-user", "transcribe").balance, 3);
});

test("released reserve replay requires a fresh action key", () => {
	const database = createDatabase();
	const input = reservationInput("replay-released");
	reserveProductCredits(database, "replay-user", input, 2000);
	const record = findReservation(database, "replay-user", input.idempotencyKey);
	releaseReservationRecord(database, record, "cancelled", 3000);
	const replay = reserveProductCredits(database, "replay-user", input, 4000);
	assert.equal(replay.ok, false);
	assert.equal(replay.error, "reservation_already_released");
	assert.equal(ensureProductCredit(database, "replay-user", "transcribe").balance, 5);
});
