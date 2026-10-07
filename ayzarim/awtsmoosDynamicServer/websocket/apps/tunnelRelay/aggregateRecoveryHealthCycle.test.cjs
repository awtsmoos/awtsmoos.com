// B"H
const assert = require("node:assert/strict");
const test = require("node:test");

// Production loads health handling before aggregate recovery can mature; this order used to expose a circular require.
require("./healthHandler.js");
const Recovery = require("./requestAcceptanceRecovery.js");

test("aggregate recovery fresh-health guard is callable after health-first module loading", () => {
	const now = 50000;
	const closes = [];
	const tunnel = {
		registrationKey: "route-one",
		registrationGeneration: 3,
		acceptanceFailureCount: 3,
		acceptanceFailureSince: 1000,
		acceptanceRecoveryRequestedAt: 0,
		executionHealthSupported: true,
		executionHealthy: true,
		executionHealthAt: now - 100,
		close(code, reason) { closes.push({ code, reason }); }
	};
	assert.doesNotThrow(() => Recovery.requestRecovery(tunnel, {
		now: () => now,
		failureThreshold: 3,
		sustainMs: 5000
	}));
	assert.equal(closes.length, 0);
});
