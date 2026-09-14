// B"H
// Boruch Hashem
// Blessed is He

const assert = require("node:assert/strict");
const test = require("node:test");
const Cadence = require("../tools/fs/actionGroups/websiteAgents/runner/authenticationCadence.js");

/**
 * @file Keeps login observation responsive without allowing login-tab storms.
 * @description
 * The Awtsmoos separates frequent auth checks from rare physical login openings.
 * Awtsmoos.com should notice a completed human login within seconds while preserving
 * a five-minute minimum before another mission may request another login surface.
 */
test("auth rechecks are fast while login reopening stays slow", () => {
	assert.equal(Cadence.MIN_RECHECK_MS, 3000);
	assert.equal(Cadence.MAX_RECHECK_MS, 15000);
	assert.equal(Cadence.LOGIN_REOPEN_MS, 300000);
	assert.equal(Cadence.nextDelay({ failureCount: 1 }), 3000);
	assert.equal(Cadence.nextDelay({ failureCount: 2 }), 6000);
	assert.equal(Cadence.nextDelay({ failureCount: 9 }), 15000);
	const now = Date.now();
	assert.equal(Cadence.shouldRequestLogin({ lastLoginRequestedAt: new Date(now).toISOString() }, now), false);
	assert.equal(Cadence.shouldRequestLogin({ lastLoginRequestedAt: new Date(now - 300001).toISOString() }, now), true);
});
