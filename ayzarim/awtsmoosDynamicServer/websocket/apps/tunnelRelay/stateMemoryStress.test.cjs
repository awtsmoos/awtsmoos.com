// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file stateMemoryStress.test.cjs
 * @description
 * The Awtsmoos permits thousands of deeds without letting their temporary echoes become sovereign.
 * Awtsmoos.com proves terminal relay mirrors plateau while durable truth remains outside this memory test.
 */

const assert = require("node:assert/strict");
const test = require("node:test");
const Constants = require("./constants.js");
const Memory = require("./stateMemory.js");

/** Create one large terminal record whose payload cannot accidentally share one object reference. */
function record(index) {
	const key = `stress-${index}`;
	return {
		key,
		id: key,
		state: "completed",
		createdAt: new Date().toISOString(),
		updatedAt: new Date().toISOString(),
		data: {
			ok: true,
			index,
			payload: `${index}:` + "x".repeat(16384)
		},
		expected: { id: key }
	};
}

test("thousands of large terminal records leave bounded mirrors", () => {
	const state = Memory.ensureStores({ tunnelRequestStarts: new Map() });
	for (let index = 0; index < 2000; index++) {
		Memory.remember(state, `stress-${index}`, record(index));
	}
	const counts = Memory.snapshot(state);
	assert.equal(counts.durable, Constants.DURABLE_MIRROR_LIMIT);
	assert.equal(counts.completed, Constants.COMPLETED_LIMIT);
	assert.equal(state.durableTunnelRequests.has("stress-0"), false);
	assert.equal(state.completedTunnelRequests.has("stress-0"), false);
	assert.ok(state.durableTunnelRequests.has("stress-1999"));
	assert.ok(state.completedTunnelRequests.has("stress-1999"));
});
