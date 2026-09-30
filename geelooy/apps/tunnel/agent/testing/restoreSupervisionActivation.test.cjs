// B"H

const assert = require("node:assert/strict");
const test = require("node:test");
const Activation = require("../recovery/restoreActivation.js");

test("restored bytes persist tier and repair supervision before success", async () => {
	const events = [];
	let inspections = 0;
	const result = await Activation.activate("/tmp/awtsmoos-test", 0, { ok: true, version: "x" }, {
		setTier: tier => events.push(`tier:${tier}`),
		repair: () => { events.push("repair"); return { ok: true }; },
		inspect: () => {
			inspections += 1;
			return inspections < 2 ? { ok: false } : { ok: true, supervisorPid: 11, childPid: 12 };
		},
		verifyTimeoutMs: 1000
	});
	assert.equal(result.ok, true);
	assert.equal(result.tier, 0);
	assert.equal(result.activation, "service_repaired");
	assert.deepEqual(events, ["tier:0", "repair"]);
	assert.equal(result.supervision.childPid, 12);
});

test("restore never reports success when canonical service repair fails", async () => {
	const result = await Activation.activate("/tmp/awtsmoos-test", 3, { ok: true, rollbackRoot: "/rollback" }, {
		setTier: () => {},
		inspect: () => ({ ok: false, supervisorPid: 0, childPid: 0 }),
		repair: () => ({ ok: false, error: "simulated_service_failure" })
	});
	assert.equal(result.ok, false);
	assert.equal(result.error, "restore_supervision_not_ready");
	assert.equal(result.rollbackRoot, "/rollback");
});

test("already verified supervision is preserved without restart", async () => {
	let repairs = 0;
	const result = await Activation.activate("/tmp/awtsmoos-test", 5, { ok: true }, {
		setTier: () => {},
		inspect: () => ({ ok: true, supervisorPid: 20, childPid: 21 }),
		repair: () => { repairs += 1; return { ok: true }; }
	});
	assert.equal(result.ok, true);
	assert.equal(result.activation, "already_verified");
	assert.equal(repairs, 0);
});
