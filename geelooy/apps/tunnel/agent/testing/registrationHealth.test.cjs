// B"H

const assert = require("node:assert/strict");
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");
const test = require("node:test");
const RegistrationHealth = require("../recovery/lanes/registrationHealth.js");

function fixture(receipt) {
	const root = fs.mkdtempSync(path.join(os.tmpdir(), "awtsmoos-registration-"));
	if (receipt !== undefined) {
		fs.writeFileSync(path.join(root, "connection-state.json"), JSON.stringify(receipt));
	}
	return root;
}

test("fresh registered receipt is healthy", t => {
	const root = fixture({ state: "registered", lastServerMessageAt: "2026-09-30T10:00:00Z" });
	t.after(() => fs.rmSync(root, { recursive: true, force: true }));
	const result = RegistrationHealth.inspect(root, { now: Date.parse("2026-09-30T10:00:30Z"), staleMs: 60000 });
	assert.equal(result.ok, true);
	assert.equal(result.reason, "registered_fresh");
});

test("stale registered receipt is unhealthy", t => {
	const root = fixture({ state: "registered", lastServerMessageAt: "2026-09-30T10:00:00Z" });
	t.after(() => fs.rmSync(root, { recursive: true, force: true }));
	const result = RegistrationHealth.inspect(root, { now: Date.parse("2026-09-30T10:02:00Z"), staleMs: 60000 });
	assert.equal(result.ok, false);
	assert.equal(result.reason, "registration_stale");
});

test("non-registered receipt is unhealthy", t => {
	const root = fixture({ state: "connecting", updatedAt: "2026-09-30T10:00:00Z" });
	t.after(() => fs.rmSync(root, { recursive: true, force: true }));
	assert.equal(RegistrationHealth.inspect(root).reason, "not_registered");
});

test("missing receipt is unhealthy", t => {
	const root = fixture(undefined);
	t.after(() => fs.rmSync(root, { recursive: true, force: true }));
	assert.equal(RegistrationHealth.inspect(root).reason, "receipt_missing");
});

test("legacy registered receipt without freshness remains compatible", t => {
	const root = fixture({ state: "registered" });
	t.after(() => fs.rmSync(root, { recursive: true, force: true }));
	const result = RegistrationHealth.inspect(root);
	assert.equal(result.ok, true);
	assert.equal(result.reason, "registered_freshness_unknown");
});
