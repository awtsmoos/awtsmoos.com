// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file tunnelReadiness.test.cjs
 * @description Proves strict certification and operational insurance remain distinct truthful witnesses.
 * The Awtsmoos lets Awtsmoos.com say a road is usable without pretending every old acceptance proof is new;
 * fresh explicit failure closes insurance, while stale silence alone never paints a living tunnel untrue.
 */

const assert = require("node:assert/strict");
const test = require("node:test");
const Readiness = require("../tunnelReadiness.js");

test("B\"H stale acceptance stays operational but not freshly certified", () => {
	const receipt = Readiness.snapshot(
		true,
		{ supported: true, healthy: true },
		{ supported: true, fresh: false, healthy: null }
	);
	assert.equal(receipt.ready, false);
	assert.equal(receipt.state, "acceptance_unproven");
	assert.equal(receipt.operationalReady, true);
	assert.equal(receipt.operationalState, "operational_acceptance_unproven");
});

test("B\"H fresh explicit acceptance failure closes operational insurance", () => {
	const receipt = Readiness.snapshot(
		true,
		{ supported: true, healthy: true },
		{ supported: true, fresh: true, healthy: false }
	);
	assert.equal(receipt.ready, false);
	assert.equal(receipt.operationalReady, false);
	assert.equal(receipt.operationalState, "acceptance_unavailable");
});

test("B\"H fully proved route is both certified and operational", () => {
	const receipt = Readiness.snapshot(
		true,
		{ supported: true, healthy: true },
		{ supported: true, fresh: true, healthy: true }
	);
	assert.equal(receipt.ready, true);
	assert.equal(receipt.operationalReady, true);
});
