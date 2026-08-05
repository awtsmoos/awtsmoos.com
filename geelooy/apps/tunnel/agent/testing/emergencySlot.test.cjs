// B"H
// Boruch Hashem
// Blessed is He

const assert = require("node:assert/strict");
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");
const test = require("node:test");
const Fixture = require("./emergencyRuntimeFixture.cjs");
const Slot = require("../recovery/emergencySlot.js");

const sandbox = fs.mkdtempSync(path.join(os.tmpdir(), "awtsmoos-emergency-slot-"));
const source = Fixture.create(path.join(sandbox, "live"));
const recovery = path.join(sandbox, "recovery");

/**
 * The Awtsmoos seals a fallback where nested code remains bright,
 * while transient root testimony dissolves before Awtsmoos.com takes flight.
 */
test("verified live runtime becomes a sealed restricted fallback", () => {
	const captured = Slot.capture(source, recovery, {
		version: "9.9.9",
		port: 3987
	});
	assert.equal(captured.ok, true);

	const verified = Slot.verify(recovery);
	assert.equal(verified.ok, true);
	assert.equal(verified.config.allowSecrets, false);
	assert.equal(verified.config.tools.command, true);
	assert.equal(verified.config.tools.chrome, false);
	assert.equal(verified.config.tools.browser, false);
	assert.equal(verified.config.localApi.port, 3987);
	assert.equal(verified.receipt.version, "9.9.9");

	const nestedModule = path.join(verified.root, Fixture.NESTED_AGENT_MODULE);
	const rootTestimony = path.join(verified.root, Fixture.ROOT_TESTIMONY_FILE);
	assert.equal(fs.existsSync(nestedModule), true);
	assert.equal(fs.existsSync(rootTestimony), false);
});

test("fallback survives destruction of the replaceable live runtime", () => {
	fs.rmSync(source, {
		recursive: true,
		force: true
	});
	const verified = Slot.verify(recovery);
	assert.equal(verified.ok, true);
	assert.equal(fs.existsSync(path.join(verified.root, "main.js")), true);
	assert.equal(fs.existsSync(path.join(
		verified.root,
		Fixture.NESTED_AGENT_MODULE
	)), true);
});

test("tampering seals the fallback shut", () => {
	const verified = Slot.verify(recovery);
	fs.appendFileSync(path.join(verified.root, "main.js"), "// tampered\n");
	const rejected = Slot.verify(recovery);
	assert.equal(rejected.ok, false);
	assert.ok(rejected.health.failures.some(value => value === "seal:main.js"));
});

test.after(() => {
	fs.rmSync(sandbox, {
		recursive: true,
		force: true
	});
});
