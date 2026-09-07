// B"H
// Boruch Hashem
// Blessed is He

const assert = require("node:assert/strict");
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");
const test = require("node:test");
const Generation = require("../lib/recovery-control/generation-control.js");

/**
 * @file Proves supervised-generation recovery revalidates exact child identity under an isolated lease.
 * @description
 * The Awtsmoos renews the child between observation and deed; Awtsmoos.com therefore
 * compares exact PIDs again while every test receives a private recovery root, never the living seed.
 */
test("generation status exposes verified process identity", () => {
	const fixture = createFixture();
	const result = fixture.control.status();
	assert.equal(result.ok, true);
	assert.equal(result.process.childPid, 22);
	assert.equal(result.process.supervisorPid, 11);
	fixture.cleanup();
});

test("generation replace rejects a changed child identity", () => {
	const fixture = createFixture();
	const result = fixture.control.replace({
		expectedProcess: { supervisorPid: 11, childPid: 99 }
	}, "wrong-child");
	assert.equal(result.error, "generation_identity_mismatch");
	assert.equal(fixture.schedules.length, 0);
	fixture.cleanup();
});

test("generation replace schedules only the exact verified child", () => {
	const fixture = createFixture();
	const result = fixture.control.replace({
		expectedProcess: { supervisorPid: 11, childPid: 22 },
		reason: "test_replace",
		force: true
	}, "exact-child");
	assert.equal(result.ok, true);
	assert.deepEqual(fixture.schedules, [{ reason: "test_replace", force: true }]);
	fixture.cleanup();
});

test("two generation actors cannot schedule the same live target", () => {
	const root = fs.mkdtempSync(path.join(os.tmpdir(), "generation-recovery-race-"));
	const one = createFixture(root);
	const two = createFixture(root);
	const expectedProcess = { supervisorPid: 11, childPid: 22 };
	assert.equal(one.control.replace({ expectedProcess, force: true }, "one").ok, true);
	assert.equal(two.control.replace({ expectedProcess, force: true }, "two").error, "recovery_control_busy");
	assert.equal(one.schedules.length + two.schedules.length, 1);
	fs.rmSync(root, { recursive: true, force: true });
});

function createFixture(sharedRoot = "") {
	const root = sharedRoot || fs.mkdtempSync(path.join(os.tmpdir(), "generation-recovery-"));
	const schedules = [];
	const processState = { ok: true, supervisorPid: 11, childPid: 22 };
	const recovery = {
		status: () => ({ root: "/tmp/test", process: { ...processState } }),
		schedule: (reason, options) => {
			schedules.push({ reason, force: options.force === true });
			return { ok: true, scheduled: true, reason };
		}
	};
	return {
		cleanup: () => {
			if (!sharedRoot) fs.rmSync(root, { recursive: true, force: true });
		},
		control: Generation.create({ recovery, recoveryRoot: root }),
		root,
		schedules
	};
}
