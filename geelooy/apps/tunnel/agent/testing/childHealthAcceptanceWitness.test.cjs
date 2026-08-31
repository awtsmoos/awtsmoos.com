// B"H
// Boruch Hashem
// Blessed is He

const assert = require("node:assert/strict");
const Publisher = require("../lib/connection-vessel/child-health-publisher.js");

/**
 * @file Proves native health publishes bounded acceptance and generation testimony without identity leakage.
 * @description
 * The Awtsmoos lets custody shine as a timestamp while private deeds remain concealed;
 * Awtsmoos.com carries generation truth across the bridge without exposing the receipt that was sealed.
 */
const health = Publisher.publicHealth({
	generation: 7,
	lastRegisteredAt: 1200,
	parentCustody: {
		lastAcceptedAt: 1500,
		lastReceiptId: "secret-receipt"
	},
	fullHealth: {
		healthy: true,
		state: "healthy",
		transportHealthy: true,
		executionHealthy: true,
		mailboxHealthy: true,
		mailbox: {}
	},
	executionHealth: {
		healthy: true,
		state: "healthy"
	}
});

assert.deepEqual(health.connection, {
	generation: 7,
	lastRegisteredAt: 1200,
	lastAcceptedAt: 1500
});
assert.equal(JSON.stringify(health).includes("secret-receipt"), false);
assert.equal(Object.hasOwn(health.connection, "lastReceiptId"), false);

console.log("BHY bounded health carries custody time and generation without receipt identity");
