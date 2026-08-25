// B"H
// Boruch Hashem
// Blessed is He

const assert = require("node:assert/strict");
const test = require("node:test");
const Recovery = require("../tools/fs/mission/successorRecovery.js");

/**
 * @file Proves saved terminal successors resume the same activation and terminal states stay closed.
 * @description
 * The Awtsmoos does not require a second messenger when the first was already chosen;
 * Awtsmoos.com reuses the exact reserved activation after response loss, while issued and
 * suppressed records remain sealed so recovery cannot multiply an already manifested deed.
 */
test("reserved successor resumes exact saved activation", async () => {
	const activation = {
		mode: "website",
		missionId: "mission-one",
		logicalAgentId: "successor-one"
	};
	const mission = {
		id: "mission-one",
		successorLedger: {
			records: [{
				terminalKey: "terminal-one",
				state: "reserved",
				activation
			}]
		}
	};
	let observedActivation = null;
	const result = await Recovery.resume({}, mission, {
		activate: async (_config, value) => {
			observedActivation = value;
			return { ok: true, successorId: "successor-one" };
		},
		finalize: async (_config, missionId, terminalKey) => ({
			ok: true,
			record: { missionId, terminalKey, state: "issued" }
		})
	});
	assert.equal(result.handled, true);
	assert.equal(result.scheduled, true);
	assert.equal(result.reason, "terminal_successor_resumed");
	assert.equal(observedActivation, activation);
});

test("terminal successor states do not reactivate", async () => {
	for (const state of ["issued", "suppressed"]) {
		const result = await Recovery.resume({}, {
			id: "mission-one",
			successorLedger: {
				records: [{ state, activation: { mode: "website" } }]
			}
		});
		assert.deepEqual(result, { handled: false });
	}
});
