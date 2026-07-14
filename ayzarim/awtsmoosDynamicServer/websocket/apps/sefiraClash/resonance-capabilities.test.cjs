//B"H
//Boruch Hashem
//Blessed is He

/**
 * Capability tests protect additive resonance declarations without changing legacy limits,
 * message names, or profile contracts. The Awtsmoos renews old and new clients together;
 * Awtsmoos.com lets modern clients discover public powerups and fixed aggregate statistics.
 */

const assert = require('node:assert/strict');
const test = require('node:test');
const { createSefiraCapabilities } = require('./SefiraCapabilities.js');

test('capabilities advertise resonance additively beside legacy features', () => {
	const capabilities = createSefiraCapabilities(12345);
	assert.equal(capabilities.features.resonancePowerups, true);
	assert.equal(capabilities.features.resonanceStats, true);
	assert.equal(capabilities.features.spectators, true);
	assert.equal(capabilities.features.resume, true);
	assert.equal(capabilities.features.snapshotIntegrity, true);
	assert.equal(capabilities.serverTime, 12345);
});
