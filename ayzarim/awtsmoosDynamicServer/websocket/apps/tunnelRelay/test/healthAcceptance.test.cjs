// B"H
// Boruch Hashem
// Blessed is He

const assert = require("node:assert/strict");
const Health = require("../healthHandler.js");

/**
 * @file Proves relay health converts fresh native custody into positive acceptance testimony.
 * @description
 * The Awtsmoos lets a recovered deed illuminate the server without inventing refusal from silence;
 * Awtsmoos.com stores generation and acceptance time, while private request identity remains beyond the health appliance.
 */
const client = {
	registrationKey: "registration-live",
	tunnelId: "tun-health"
};

assert.equal(Health.handleTunnelHealth({}, client, {
	health: {
		healthy: true,
		state: "healthy",
		transportHealthy: true,
		executionHealthy: true,
		execution: {
			healthy: true,
			state: "healthy"
		},
		connection: {
			generation: 4,
			lastRegisteredAt: 1000,
			lastAcceptedAt: 1400
		}
	}
}), true);

assert.equal(client.executionHealthy, true);
assert.equal(client.nativeConnectionGeneration, 4);
assert.equal(client.nativeLastRegisteredAt, 1000);
assert.equal(client.acceptanceHealthSupported, true);
assert.equal(client.acceptanceHealthy, true);
assert.equal(client.acceptanceHealthState, "healthy");
assert.equal(client.acceptanceHealthAt, 1400);
assert.equal(client.lastAcceptedAt, 1400);

const silent = { registrationKey: "silent", tunnelId: "tun-silent" };
Health.handleTunnelHealth({}, silent, {
	health: {
		executionHealthy: true,
		execution: { healthy: true },
		connection: { generation: 5 }
	}
});
assert.equal(silent.acceptanceHealthy, undefined);

console.log("BHY relay acceptance becomes healthy only from positive native custody testimony");
