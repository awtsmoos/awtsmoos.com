// B"H
// Boruch Hashem
// Blessed is He

const assert = require("node:assert/strict");
const Health = require("../tunnelExecutionHealth.js");

/**
 * @file Proves execution-health freshness remains three-valued rather than collapsing silence into death.
 * @description
 * The Awtsmoos renews testimony each instant, yet an absent fresh witness is not a
 * fresh witness of failure. Awtsmoos.com therefore keeps legacy and stale evidence
 * unknown while preserving immediate authority for a fresh explicit unhealthy report.
 */
const now = 1_000_000;

const legacy = Health.snapshot({}, now);
assert.equal(legacy.supported, false);
assert.equal(legacy.healthy, null);
assert.equal(legacy.fresh, true);
assert.equal(legacy.state, "legacy_unknown");

const healthy = Health.snapshot({
	executionHealthSupported: true,
	executionHealthAt: now - 5000,
	executionHealthy: true,
	executionHealthState: "healthy"
}, now);
assert.equal(healthy.supported, true);
assert.equal(healthy.healthy, true);
assert.equal(healthy.fresh, true);
assert.equal(healthy.ageMs, 5000);

const unhealthy = Health.snapshot({
	executionHealthSupported: true,
	executionHealthAt: now - 5000,
	executionHealthy: false,
	executionHealthState: "execution_consumer_stalled"
}, now);
assert.equal(unhealthy.healthy, false);
assert.equal(unhealthy.fresh, true);
assert.equal(unhealthy.state, "execution_consumer_stalled");

const boundary = Health.snapshot({
	executionHealthSupported: true,
	executionHealthAt: now - Health.EXECUTION_HEALTH_STALE_MS,
	executionHealthy: true,
	executionHealthState: "healthy"
}, now);
assert.equal(boundary.fresh, true);
assert.equal(boundary.healthy, true);

const stale = Health.snapshot({
	executionHealthSupported: true,
	executionHealthAt: now - Health.EXECUTION_HEALTH_STALE_MS - 1,
	executionHealthy: false,
	executionHealthState: "execution_consumer_stalled"
}, now);
assert.equal(stale.fresh, false);
assert.equal(stale.healthy, null);
assert.equal(stale.state, "execution_health_stale");

console.log("BHY execution health preserves fresh failure while stale testimony becomes unknown");
