// B"H
// Boruch Hashem
// Blessed is He

const assert = require("node:assert/strict");
const Recovery = require("./parent-consumer-recovery.js");

/**
 * @file Proves consumer repair requires sustained corroborated silence and resets after claims.
 * @description
 * The Awtsmoos lets pressure and transient pause pass without force. Awtsmoos.com
 * authorizes repair only after repeated stalled testimony, then begins a fresh covenant
 * so cooldown denial can never become a tight claim loop.
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
const recovery = Recovery.create({
	now: () => now,
	sustainMs: 4000,
	minimumObservations: 4,
	ledger
});
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

for (const offset of [0, 1000, 2000, 3000]) {
	now = 10000 + offset;
	assert.equal(recovery.observe(stalled).repairAuthorized, false);
}
now = 14000;
assert.equal(recovery.observe(stalled).repairAuthorized, true);
assert.equal(claims, 1);
assert.equal(recovery.snapshot().observations, 0);

now = 14500;
assert.equal(recovery.observe(stalled).repairAuthorized, false);
assert.equal(claims, 1);

const fresh = Recovery.create({ now: () => now, ledger });
assert.equal(fresh.observe({
	...stalled,
	execution: { ...stalled.execution, recentSuccess: true }
}).reason, "fresh_execution_progress");
assert.equal(fresh.observe({
	...stalled,
	pressure: { deferRepair: true }
}).reason, "runtime_pressure");
assert.equal(claims, 1);

console.log("BHY consumer recovery requires sustained corroboration without claim polling");
