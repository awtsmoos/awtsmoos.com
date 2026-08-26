// B"H
// Boruch Hashem
// Blessed is He

const assert = require("node:assert/strict");
const Recovery = require("./parent-consumer-recovery.js");

/**
 * @file Recreates the false-SIGTERM race and proves a true persistent stall still heals.
 * @description
 * The Awtsmoos renews every witness; Awtsmoos.com therefore lets fresh progress cancel
 * a mature stale candidate before Gevurah claims repair, while truly sustained silence
 * survives preflight and earns exactly one bounded recovery deed.
 */
let now = 10000;
let claims = 0;
const ledger = {
	claim(reason) {
		claims += 1;
		return { allowed: true, reason, recentRepairs: claims };
	},
	status() {
		return { history: [] };
	}
};

const stalled = {
	registered: true,
	parentUnresponsive: false,
	controlStalled: false,
	pressure: { deferRepair: false },
	execution: {
		backpressured: false,
		consumerStalled: true,
		ingressStalled: true,
		recentSuccess: false,
		repairing: false
	}
};

const raced = Recovery.create({
	ledger,
	minimumObservations: 2,
	now: () => now,
	preflightOptions: { minimumObservations: 2, preflightMs: 250 },
	sustainMs: 1000
});

assert.equal(raced.observe(stalled).repairAuthorized, false);
now = 11000;
const mature = raced.observe(stalled);
assert.equal(mature.repairAuthorized, false);
assert.equal(mature.reason, "repair_preflight");
assert.equal(claims, 0);

now = 11250;
const fresh = raced.observe({
	...stalled,
	execution: { ...stalled.execution, recentSuccess: true }
});
assert.equal(fresh.reason, "fresh_execution_progress");
assert.equal(fresh.repairAuthorized, false);
assert.equal(raced.snapshot().preflight.active, false);
assert.equal(claims, 0);

now = 20000;
const persistent = Recovery.create({
	ledger,
	minimumObservations: 2,
	now: () => now,
	preflightOptions: { minimumObservations: 2, preflightMs: 250 },
	sustainMs: 1000
});
assert.equal(persistent.observe(stalled).repairAuthorized, false);
now = 21000;
assert.equal(persistent.observe(stalled).reason, "repair_preflight");
assert.equal(claims, 0);
now = 21250;
const repaired = persistent.observe(stalled);
assert.equal(repaired.repairAuthorized, true);
assert.equal(repaired.reason, "execution_ingress_stalled");
assert.equal(repaired.claimReason, "execution_ingress_stalled");
assert.equal(claims, 1);
assert.equal(persistent.snapshot().observations, 0);
assert.equal(persistent.snapshot().preflight.active, false);

now = 21300;
assert.equal(persistent.observe(stalled).repairAuthorized, false);
assert.equal(claims, 1);

console.log("BHY consumer recovery preflight cancels stale races and preserves true healing");
