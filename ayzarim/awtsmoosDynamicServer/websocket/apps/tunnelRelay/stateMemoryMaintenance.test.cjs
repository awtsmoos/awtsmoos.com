// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file stateMemoryMaintenance.test.cjs
 * @description
 * The Awtsmoos lets active work remain while terminal mirrors return to their measured shore.
 * Awtsmoos.com proves memory has a boundary without confusing the boundary for durable truth.
 */

const assert = require("node:assert/strict");
const test = require("node:test");
const Constants = require("./constants.js");
const Memory = require("./stateMemory.js");

/** Build one terminal durable record with enough shape for the real mirror path. */
function terminal(key, at = Date.now(), payload = "ok") {
	return {
		key,
		id: key,
		state: "completed",
		createdAt: new Date(at).toISOString(),
		updatedAt: new Date(at).toISOString(),
		data: { ok: true, payload },
		expected: { id: key }
	};
}

/** Build an empty relay context exactly as the runtime does before first use. */
function context() {
	return Memory.ensureStores({ tunnelRequestStarts: new Map() });
}

test("terminal durable and completed mirrors plateau at configured limits", () => {
	const state = context();
	for (let index = 0; index < Constants.DURABLE_MIRROR_LIMIT + 80; index++) {
		Memory.remember(state, `terminal-${index}`, terminal(`terminal-${index}`));
	}
	const counts = Memory.snapshot(state);
	assert.equal(counts.durable, Constants.DURABLE_MIRROR_LIMIT);
	assert.equal(counts.completed, Constants.COMPLETED_LIMIT);
	assert.equal(state.durableTunnelRequests.has("terminal-0"), false);
});

test("old terminal mirrors age out while an active pending key remains protected", () => {
	const state = context();
	const old = Date.now() - Constants.DURABLE_MIRROR_TTL_MS - 1000;
	state.pendingTunnelRequests.set("active-old", { resolve() {} });
	Memory.remember(state, "active-old", terminal("active-old", old));
	Memory.remember(state, "inactive-old", terminal("inactive-old", old));
	Memory.cleanup(state, Date.now());
	assert.ok(Memory.observed(state, "active-old"));
	assert.equal(Memory.observed(state, "inactive-old"), null);
});

test("snapshot makes the durable mirror visible and cleanup is idempotent", () => {
	const state = context();
	Memory.remember(state, "one", terminal("one"));
	Memory.cleanup(state);
	Memory.cleanup(state);
	assert.deepEqual(Memory.snapshot(state), {
		pending: 0,
		completed: 1,
		durable: 1,
		expired: 0,
		quarantined: 0
	});
});
