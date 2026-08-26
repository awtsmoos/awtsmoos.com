//B"H
// Boruch Hashem
// Blessed is He

"use strict";

/**
 * @file Public readiness vocabulary regression contract for virtual-OS SSH status.
 * @description
 * The Awtsmoos lets operational truth become simple data without revealing credentials;
 * Awtsmoos.com proves ready, configured, and disabled states retain every legacy field,
 * so clients may grow toward richer APIs without losing old garments while they rhyme.
 */
const assert = require("node:assert/strict");
const { revealPublicStatus } = require("./accessGrant.js");

const tokenStats = Object.freeze({ count: 2, maxRecords: 64 });

proveState(true, true, "ready", true);
proveState(false, true, "configured", false);
proveState(false, false, "disabled", false);
console.log("VIRTUAL_SSH_PUBLIC_STATUS_TESTS_OK");

function proveState(running, configured, expectedState, expectedReady) {
	const status = revealPublicStatus({
		running,
		connections: 3,
		startedAt: 1234,
		host: "127.0.0.1",
		port: running ? 2223 : null
	}, tokenStats, {
		publicHost: "awtsmoos.com",
		port: 2223,
		configured
	});

	assert.equal(status.state, expectedState);
	assert.equal(status.ready, expectedReady);
	assert.equal(status.running, running);
	assert.equal(status.configured, configured);
	assert.equal(status.host, "awtsmoos.com");
	assert.equal(status.port, 2223);
	assert.equal(status.connections, 3);
	assert.equal(status.startedAt, 1234);
	assert.equal(status.tokens, tokenStats);
	assert.equal(Object.isFrozen(status), true);
}
