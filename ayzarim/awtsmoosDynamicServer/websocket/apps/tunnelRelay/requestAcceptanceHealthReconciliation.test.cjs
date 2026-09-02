// B"H
// Boruch Hashem
// Blessed is He

const assert = require("node:assert/strict");
const Health = require("./healthHandler.js");
const Recovery = require("./requestAcceptanceRecovery.js");

/**
 * @file Proves advancing native acceptance health invalidates older recovery authority.
 * @description
 * The Awtsmoos lets a new accepted deed dissolve an old silence without confusing repetition
 * for progress. Awtsmoos.com keeps stale timestamps fenced, fresh testimony sovereign, and
 * canceled timer callbacks forever inert after the current acceptance shore has been renewed.
 */
(function proveRecoveryWitnessOrdering() {
	let now = 10000;
	let scheduled = null;
	const closes = [];
	const tunnel = liveTunnel(1400);
	const options = {
		now: () => now,
		failureThreshold: 3,
		sustainMs: 30000,
		schedule(callback, delay) {
			scheduled = { callback, delay, unref() {} };
			return scheduled;
		},
		cancel() {},
		close(_client, code, reason) {
			closes.push([code, reason]);
		}
	};

	Recovery.noteFailure(tunnel, "a", "timeout", options);
	Recovery.noteFailure(tunnel, "b", "timeout", options);
	Recovery.noteFailure(tunnel, "c", "timeout", options);
	assert.equal(tunnel.acceptanceFailureHealthWitnessAt, 1400);
	assert.equal(Recovery.noteHealthSuccess(tunnel, 1400, options), false);
	assert.equal(tunnel.acceptanceFailureCount, 3);

	const oldCallback = scheduled.callback;
	assert.equal(Recovery.noteHealthSuccess(tunnel, 1500, options), true);
	assert.equal(tunnel.acceptanceFailureCount, 0);
	assert.equal(tunnel.acceptanceHealthy, true);
	now = 50000;
	assert.equal(oldCallback(), false);
	assert.equal(closes.length, 0);
})();

(function proveHealthHandlerUsesOnlyAdvancingAcceptance() {
	const client = {
		...liveTunnel(2000),
		registrationKey: "registration-health",
		tunnelId: "tun-health-reconcile"
	};
	Recovery.noteFailure(client, "first", "timeout");
	assert.equal(client.acceptanceFailureCount, 1);

	Health.handleTunnelHealth({}, client, healthFrame(2000));
	assert.equal(client.acceptanceFailureCount, 1);
	assert.equal(client.acceptanceHealthy, false);
	assert.equal(client.acceptanceHealthState, "degraded");

	Health.handleTunnelHealth({}, client, healthFrame(2100));
	assert.equal(client.acceptanceFailureCount, 0);
	assert.equal(client.acceptanceHealthy, true);
	assert.equal(client.acceptanceHealthState, "healthy");
	assert.equal(client.acceptanceHealthAt, 2100);
})();

console.log("BHY advancing native acceptance health invalidates stale recovery authority");

/** Creates one current registration with a monotonic native acceptance baseline. */
function liveTunnel(lastAcceptedAt) {
	return {
		connected: true,
		isAlive: true,
		lastAcceptedAt,
		registeredAt: 1000,
		registrationGeneration: 7
	};
}

/** Creates authenticated native health testimony carrying one acceptance timestamp. */
function healthFrame(lastAcceptedAt) {
	return {
		health: {
			healthy: true,
			transportHealthy: true,
			executionHealthy: true,
			execution: {
				healthy: true,
				state: "healthy"
			},
			connection: {
				generation: 7,
				lastRegisteredAt: 1000,
				lastAcceptedAt
			}
		}
	};
}
