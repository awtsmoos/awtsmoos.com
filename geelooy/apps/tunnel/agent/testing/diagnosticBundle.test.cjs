// B"H

const assert = require("node:assert/strict");
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");
const test = require("node:test");
const Bundle = require("../lib/diagnostics/bundle.js");

/**
 * @file Proves incident bundles survive failure without disclosing identity secrets.
 */
test("diagnostic bundle is private, archived, bounded, and redacted", () => {
	const root = fs.mkdtempSync(path.join(os.tmpdir(), "awts-diagnostic-bundle-"));
	const installRoot = path.join(root, "install");
	const recoveryRoot = path.join(root, "recovery");
	fs.mkdirSync(path.join(recoveryRoot, "state"), { recursive: true });
	fs.mkdirSync(path.join(recoveryRoot, "logs"), { recursive: true });
	fs.mkdirSync(installRoot, { recursive: true });
	fs.writeFileSync(path.join(recoveryRoot, "state", "device-binding.json"), JSON.stringify({
		deviceId: "device-a",
		tunnelName: "tunnel-a",
		privateKey: "PRIVATE-KEY-MARKER",
		deviceCredential: "CREDENTIAL-MARKER",
		pairingCode: "PAIRING-MARKER"
	}));
	fs.writeFileSync(path.join(recoveryRoot, "logs", "install.jsonl"),
		'{"phase":"registration","token":"TOKEN-MARKER"}\n');
	fs.writeFileSync(path.join(installRoot, "config.json"), JSON.stringify({
		tunnelName: "tunnel-a",
		password: "PASSWORD-MARKER"
	}));
	try {
		const result = Bundle.create({
			installRoot,
			recoveryRoot,
			now: new Date("2026-08-05T07:00:00.000Z")
		});
		assert.equal(result.ok, true);
		assert.equal(fs.statSync(result.directory).mode & 0o777, 0o700);
		assert.equal(fs.statSync(result.reportFile).mode & 0o777, 0o600);
		assert.ok(result.archive);
		assert.equal(fs.statSync(result.archive).mode & 0o777, 0o600);
		const report = fs.readFileSync(result.reportFile, "utf8");
		for (const marker of [
			"PRIVATE-KEY-MARKER",
			"CREDENTIAL-MARKER",
			"PAIRING-MARKER",
			"TOKEN-MARKER",
			"PASSWORD-MARKER"
		]) assert.equal(report.includes(marker), false);
		assert.match(report, /\[REDACTED\]/);
		assert.match(report, /sha256:[a-f0-9]{16}/);
	} finally {
		fs.rmSync(root, { recursive: true, force: true });
	}
});
