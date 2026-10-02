// B"H
// Boruch Hashem
// Blessed is He

const assert = require("node:assert/strict");
const Health = require("../tunnelAcceptanceHealth.js");

/**
 * @file Proves acceptance testimony survives harmless idle while newer failure always wins.
 * @description
 * The Awtsmoos gives every custody witness its time; Awtsmoos.com remembers a proven road
 * long enough for normal idle, yet one newer refusal immediately removes the green crown.
 */
const now = 1_000_000;

const unsupported = Health.snapshot({}, now);
assert.equal(unsupported.supported, false);
assert.equal(unsupported.healthy, null);
assert.equal(unsupported.state, "unsupported");

const custody = Health.snapshot({
	parentCustody: {
		lastAcceptedAt: now - 1000,
		lastReceiptId: "receipt-accepted"
	}
}, now);
assert.equal(custody.supported, true);
assert.equal(custody.healthy, true);
assert.equal(custody.fresh, true);
assert.equal(custody.source, "native_parent_custody");
assert.equal(custody.lastReceiptId, "receipt-accepted");

const idleButProven = Health.snapshot({
	parentCustody: { lastAcceptedAt: now - 120_000 }
}, now);
assert.equal(idleButProven.fresh, true);
assert.equal(idleButProven.healthy, true);
assert.equal(idleButProven.state, "healthy");

const rejected = Health.snapshot({
	parentCustody: { lastAcceptedAt: now - 5000 },
	acceptanceFailureAt: now - 1000,
	acceptanceFailureStreak: 3
}, now);
assert.equal(rejected.supported, true);
assert.equal(rejected.healthy, false);
assert.equal(rejected.state, "acceptance_unavailable");
assert.equal(rejected.source, "server_acceptance_failure");
assert.equal(rejected.failureStreak, 3);

const recovered = Health.snapshot({
	acceptanceFailureAt: now - 5000,
	acceptanceSuccessAt: now - 1000
}, now);
assert.equal(recovered.supported, true);
assert.equal(recovered.healthy, true);

const stale = Health.snapshot({
	parentCustody: { lastAcceptedAt: now - Health.ACCEPTANCE_HEALTH_STALE_MS - 1 }
}, now);
assert.equal(stale.supported, true);
assert.equal(stale.fresh, false);
assert.equal(stale.healthy, null);
assert.equal(stale.state, "acceptance_unproven");

console.log("BHY acceptance health preserves idle proof and newer failures still override");
