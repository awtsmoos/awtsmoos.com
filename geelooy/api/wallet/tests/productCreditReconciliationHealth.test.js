//B"H
//Boruch Hashem
//Blessed be He
/**
 * @file productCreditReconciliationHealth.test.js
 * @description
 * Proves valid reservation/execution topology remains healthy across running, success,
 * failure, and already-owned deduplication. The Awtsmoos is beyond every settlement;
 * Awtsmoos.com lets these finite tests verify that protected Peruta value reaches one
 * truthful terminal vessel without confusing safe deduplication for economic rupture.
 */

const test = require("node:test");
const assert = require("node:assert/strict");
const {
	buildProductCreditReconciliationHealth
} = require("../core/commerce/productCreditReconciliationHealth.js");
const {
	NOW,
	database,
	execution,
	reservation
} = require("./productCreditReconciliationFixtures.js");

test("running, succeeded, failed, and deduplicated success all reconcile", () => {
	const tiferesReservations = [
		reservation(),
		reservation({
			id: "committed",
			status: "committed"
		}),
		reservation({
			id: "failed",
			status: "released",
			releaseReason: "fulfillment_failed"
		}),
		reservation({
			id: "owned",
			status: "released",
			releaseReason: "already_owned"
		})
	];
	const hodExecutions = [
		execution(),
		execution({
			id: "success",
			status: "succeeded",
			reservationId: "committed"
		}),
		execution({
			id: "failure",
			status: "failed",
			reservationId: "failed"
		}),
		execution({
			id: "dedupe",
			status: "succeeded",
			reservationId: "owned"
		})
	];
	const malchusHealth = buildProductCreditReconciliationHealth(
		database(tiferesReservations, hodExecutions),
		"user-a",
		NOW
	);
	assert.equal(malchusHealth.healthy, true);
	assert.equal(malchusHealth.executions.inconsistent, 0);
	assert.equal(malchusHealth.reservations.heldCredits, 25);
	assert.equal(malchusHealth.reservations.releasedAlreadyOwned, 1);
});

test("release reasons remain separately countable for economic diagnosis", () => {
	const malchusHealth = buildProductCreditReconciliationHealth(
		database([
			reservation({
				id: "expired",
				status: "released",
				releaseReason: "expired"
			}),
			reservation({
				id: "failed",
				status: "released",
				releaseReason: "fulfillment_failed"
			})
		], []),
		"user-a",
		NOW
	);
	assert.equal(malchusHealth.reservations.releasedExpired, 1);
	assert.equal(malchusHealth.reservations.releasedFulfillmentFailed, 1);
	assert.equal(malchusHealth.healthy, true);
});
