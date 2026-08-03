// B"H
// Boruch Hashem
// Blessed is He

const assert = require("node:assert/strict");
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");
const { spawnSync } = require("node:child_process");

/**
 * @file Proves supervisor recovery receives one stable scalar reason.
 * @description JSON receipt diagnostics remain available without becoming a reason.
 */
const repositoryRoot = path.resolve(__dirname, "../../../../..");
const receiptSource = path.join(
	repositoryRoot,
	"geelooy/apps/tunnel/downloads/unix-supervisor-receipt.sh"
);
const root = fs.mkdtempSync(path.join(os.tmpdir(), "awts-supervisor-reason-"));

try {
	fs.writeFileSync(path.join(root, "config.json"), JSON.stringify({
		tunnelName: "awt-test-device"
	}));
	fs.writeFileSync(path.join(root, "install-state.txt"), "1.0.500\n");

	writeReceipt({
		state: "registration_rejected",
		reason: "invalid_device_credential",
		pid: 4242
	});
	assert.equal(reason(), "registration_invalid_device_credential");

	writeReceipt(registered({ pid: 9999 }));
	assert.equal(reason(), "registration_receipt_pid_mismatch");

	writeReceipt(registered({ runtimeVersion: "1.0.499" }));
	assert.equal(reason(), "registration_runtime_version_mismatch");

	writeReceipt(registered());
	assert.equal(reason(), "registration_stability_timeout");

	const diagnostic = state();
	assert.equal(JSON.parse(diagnostic).state, "registered");
	for (const value of [reason(), "registration_invalid_device_credential"]) {
		assert.doesNotMatch(value, /[{}"\s]/);
	}

	console.log(JSON.stringify({
		ok: true,
		suite: "supervisor-receipt-failure-reason",
		scalarReasons: true,
		jsonDiagnosticPreserved: true
	}, null, 2));
} finally {
	fs.rmSync(root, { recursive: true, force: true });
}

function registered(overrides = {}) {
	return {
		state: "registered",
		pid: 4242,
		tunnelName: "awt-test-device",
		tunnelId: "tun_test",
		runtimeVersion: "1.0.500",
		updatedAt: new Date().toISOString(),
		...overrides
	};
}

function writeReceipt(receipt) {
	fs.writeFileSync(path.join(root, "connection-state.json"), JSON.stringify(receipt));
}

function reason() {
	return invoke('supervisor_receipt_failure_reason "4242"');
}

function state() {
	return invoke("supervisor_receipt_state");
}

function invoke(command) {
	const result = spawnSync("bash", ["-c", [
		'set -Eeuo pipefail',
		'ROOT="$TEST_ROOT"',
		'source "$RECEIPT_SOURCE"',
		command
	].join("\n")], {
		encoding: "utf8",
		env: {
			...process.env,
			TEST_ROOT: root,
			RECEIPT_SOURCE: receiptSource
		}
	});
	assert.equal(result.status, 0, result.stderr || result.stdout);
	return result.stdout.trim();
}
