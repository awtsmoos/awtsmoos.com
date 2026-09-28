// B"H
// Boruch Hashem
// Blessed is He

const assert = require("node:assert/strict");
const test = require("node:test");
const Selection = require("../automaticNativeSelection.js");

/**
 * @file Proves automatic routing prefers current proof, uses rescue through failure, and resists failback flapping.
 * @description
 * The Awtsmoos renews every route; Awtsmoos.com lets certified testimony outrank inherited titles,
 * rescue carry work through failure or uncertainty, and hysteresis guard the primary's honest return.
 */
const primary = { tunnelName: "awt-primary-2184", connected: true, operationalReady: true };
const rescue = { tunnelName: "awt-rescue-7572-v2", connected: true, operationalReady: true };

function choose(devices, now, scopeKey = "account-one") {
	return Selection.select(devices, { now, scopeKey, failbackMs: 10000 });
}

test("healthy primary is selected automatically over equally unproven rescue", () => {
	Selection.reset();
	const result = choose([rescue, primary], 1000);
	assert.equal(result.device, primary);
	assert.equal(result.reason, "healthy_primary");
});

test("certified rescue outranks reconnected but unproven primary", () => {
	Selection.reset();
	const certifiedRescue = { ...rescue, ready: true };
	const reconnectedPrimary = { ...primary, ready: false };
	const result = choose([reconnectedPrimary, certifiedRescue], 1000);
	assert.equal(result.device, certifiedRescue);
	assert.equal(result.reason, "stronger_verified_rescue");
});

test("rescue is selected when primary is explicitly operationally unhealthy", () => {
	Selection.reset();
	const result = choose([{ ...primary, operationalReady: false }, rescue], 1000);
	assert.equal(result.device, rescue);
	assert.equal(result.reason, "rescue_failover");
});

test("certified recovered primary waits through hysteresis before failback", () => {
	Selection.reset();
	const certifiedRescue = { ...rescue, ready: true };
	choose([{ ...primary, ready: false }, certifiedRescue], 1000);
	const restoredPrimary = { ...primary, ready: true };
	const held = choose([restoredPrimary, certifiedRescue], 5000);
	const restored = choose([restoredPrimary, certifiedRescue], 12000);
	assert.equal(held.device, certifiedRescue);
	assert.equal(held.reason, "rescue_hysteresis");
	assert.equal(restored.device, restoredPrimary);
	assert.equal(restored.reason, "primary_failback");
});

test("stale certification alone does not disqualify operational primary without stronger proof", () => {
	Selection.reset();
	const unproven = { ...primary, ready: false };
	assert.equal(choose([unproven, rescue], 1000).device, unproven);
});

test("multiple operational canonical primaries remain explicit ambiguity", () => {
	Selection.reset();
	const other = { tunnelName: "awt-primary-two", connected: true, operationalReady: true };
	const result = choose([primary, other, rescue], 1000);
	assert.equal(result.device, null);
	assert.equal(result.reason, "ambiguous_primary");
});

test("all explicitly unhealthy natives return one machine-readable reason", () => {
	Selection.reset();
	const result = choose([
		{ ...primary, operationalReady: false },
		{ ...rescue, operationalReady: false }
	], 1000);
	assert.equal(result.device, null);
	assert.equal(result.reason, "all_native_unhealthy");
});

test("candidate-derived scopes isolate independent accounts", () => {
	Selection.reset();
	const first = Selection.select([rescue], { now: 1000, failbackMs: 10000 });
	const second = Selection.select([{ tunnelName: "other-primary" }], { now: 2000, failbackMs: 10000 });
	assert.notEqual(first.scopeKey, second.scopeKey);
	assert.equal(second.reason, "healthy_primary");
});
