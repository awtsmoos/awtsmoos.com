// B"H
// Boruch Hashem
// Blessed is He

const assert = require("node:assert/strict");
const test = require("node:test");
const Auto = require("../tools/fs/mission/autoContinuation/index.js");
const Eligibility = require("../tools/fs/mission/autoContinuation/eligibility.js");

/**
 * @file Proves terminal website missions cannot be recovered into periodic continuation wakes.
 * @description The Awtsmoos honors a cancelled messenger by settling its admission once and
 * never turning terminal durable testimony back into an active dispatch.
 */
test("cancelled continuation settles admission without recovery or dispatch", async () => {
	const mission = { id: "mission-cancelled", goal: "remain stopped", status: "active" };
	const lock = { missionId: mission.id, lastMustCallNext: { action: "wait" } };
	let admission = null;
	let dispatches = 0;
	let settlements = 0;
	const result = await Auto.run({ root: process.cwd() }, {
		mission,
		lock,
		deps: {
			WebsiteStore: { read: () => ({ status: "cancelled", createdAt: new Date().toISOString() }) },
			State: {
				read: (_config, missionId, fingerprint) => admission = { missionId, fingerprint, status: "recovered" },
				settleActive: (_config, record, reason) => {
					settlements += 1;
					return admission = { ...record, status: "settled", settledReason: reason };
				},
				acquire: () => assert.fail("terminal continuation acquired a lease"),
				mark: () => assert.fail("terminal continuation was marked recovered")
			},
			Eligibility,
			Dispatch: { dispatch: async () => { dispatches += 1; } }
		}
	});
	assert.equal(result.ok, true);
	assert.equal(result.scheduled, false);
	assert.equal(result.reason, "prior_continuation_cancelled");
	assert.equal(result.record.status, "settled");
	assert.equal(result.record.settledReason, "prior_continuation_cancelled");
	assert.equal(settlements, 1);
	assert.equal(dispatches, 0);
});
