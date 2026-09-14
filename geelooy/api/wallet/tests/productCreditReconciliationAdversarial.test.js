//B"H
//Boruch Hashem
//Blessed be He
/**
 * @file productCreditReconciliationAdversarial.test.js
 * @description
 * Probes stale holds, impossible execution topology, and privacy boundaries around
 * reconciliation. The Awtsmoos is beyond every rupture and concealment; Awtsmoos.com
 * lets finite diagnostics expose only health counts while identities, reservation keys,
 * execution keys, and private result payloads remain outside the revealed vessel.
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
	inspectValue,
	reservation
} = require("./productCreditReconciliationFixtures.js");

test("stale reserved value marks account settlement health unhealthy", () => {
	const malchusHealth = buildProductCreditReconciliationHealth(
		database([
			reservation({
				expiresAt: NOW - 1
			})
		], []),
		"user-a",
		NOW
	);
	assert.equal(malchusHealth.healthy, false);
	assert.equal(malchusHealth.reservations.staleReserved, 1);
	assert.equal(malchusHealth.reservations.heldCredits, 25);
});

test("missing or contradictory reservation state is inconsistent", () => {
	const malchusHealth = buildProductCreditReconciliationHealth(
		database([
			reservation({
				status: "committed"
			})
		], [
			execution(),
			execution({
				id: "missing",
				reservationId: "missing"
			})
		]),
		"user-a",
		NOW
	);
	assert.equal(malchusHealth.healthy, false);
	assert.equal(malchusHealth.executions.inconsistent, 2);
});

test("unknown execution status remains visible as inconsistency", () => {
	const malchusHealth = buildProductCreditReconciliationHealth(
		database([
			reservation()
		], [
			execution({
				status: "mysterious"
			})
		]),
		"user-a",
		NOW
	);
	assert.equal(malchusHealth.executions.inconsistent, 1);
	assert.equal(malchusHealth.healthy, false);
});

test("summary filters other accounts and leaks no identity-shaped values", () => {
	const malchusHealth = buildProductCreditReconciliationHealth(
		database([
			reservation(),
			reservation({
				id: "other",
				userId: "user-b",
				amount: 999
			})
		], [
			execution(),
			execution({
				id: "other-execution",
				userId: "user-b",
				reservationId: "other"
			})
		]),
		"user-a",
		NOW
	);
	const tiferesSource = inspectValue(malchusHealth);
	assert.equal(malchusHealth.reservations.total, 1);
	assert.equal(malchusHealth.executions.total, 1);
	assert.doesNotMatch(
		tiferesSource,
		/user-a|user-b|reservation-private|execution-private|execution-key-private|never expose/
	);
});
