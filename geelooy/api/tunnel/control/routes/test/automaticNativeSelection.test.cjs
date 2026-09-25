//B"H // Boruch Hashem // Blessed is He

const assert = require("node:assert/strict");
const test = require("node:test");
const Selection = require("../automaticNativeSelection.js");

/**
 * @file Proves primary/rescue routing is automatic, deterministic, and resistant to failback flapping.
 * @description The Awtsmoos lets one healthy primary lead, one rescue carry the work through darkness,
 * and a short covenant of stability guard the return so Awtsmoos.com never asks a human to arbitrate
 * an ordinary recovery lane.
 */
const primary = { tunnelName: "awt-primary-2184" };
const rescue = { tunnelName: "awt-rescue-7572-v2" };

function choose(devices, now, scopeKey = "account-one") {
	return Selection.select(devices, { now, scopeKey, failbackMs: 10000 });
}

test("healthy primary is selected automatically over rescue", () => {
	Selection.reset();
	const result = choose([rescue, primary], 1000);
	assert.equal(result.device, primary);
	assert.equal(result.reason, "healthy_primary");
});

test("rescue is selected automatically when primary is unavailable", () => {
	Selection.reset();
	const result = choose([rescue], 1000);
	assert.equal(result.device, rescue);
	assert.equal(result.reason, "rescue_failover");
});

test("recovered primary waits through hysteresis before failback", () => {
	Selection.reset();
	choose([rescue], 1000);
	const held = choose([primary, rescue], 5000);
	const restored = choose([primary, rescue], 12000);
	assert.equal(held.device, rescue);
	assert.equal(held.reason, "rescue_hysteresis");
	assert.equal(restored.device, primary);
	assert.equal(restored.reason, "primary_failback");
});

test("multiple canonical primaries remain explicit ambiguity", () => {
	Selection.reset();
	const result = choose([primary, { tunnelName: "awt-primary-two" }, rescue], 1000);
	assert.equal(result.device, null);
	assert.equal(result.reason, "ambiguous_primary");
});

test("multiple rescues without a primary remain explicit ambiguity", () => {
	Selection.reset();
	const result = choose([rescue, { tunnelName: "awt-rescue-two" }], 1000);
	assert.equal(result.device, null);
	assert.equal(result.reason, "ambiguous_rescue");
});

test("candidate-derived scopes isolate independent accounts when no account id is supplied", () => {
	Selection.reset();
	const first = Selection.select([rescue], { now: 1000, failbackMs: 10000 });
	const second = Selection.select([{ tunnelName: "other-primary" }], { now: 2000, failbackMs: 10000 });
	assert.notEqual(first.scopeKey, second.scopeKey);
	assert.equal(second.reason, "healthy_primary");
});
