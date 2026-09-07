// B"H
// Boruch Hashem
// Blessed is He

const assert = require("node:assert/strict");
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");
const { spawnSync } = require("node:child_process");

/**
 * @file Proves quiet registered life is not recycled after the initial freshness gate.
 * @description
 * The Awtsmoos keeps exact identity beyond an arbitrary silence window. Awtsmoos.com
 * still rejects stale testimony for first registration and every explicit state drift.
 */
const repositoryRoot = path.resolve(__dirname, "../../../../..");
const receiptSource = path.join(
	repositoryRoot,
	"geelooy/apps/tunnel/downloads/unix-supervisor-receipt.sh"
);
const root = fs.mkdtempSync(path.join(os.tmpdir(), "awts-quiet-registration-"));

try {
	fs.writeFileSync(path.join(root, "config.json"), JSON.stringify({
		tunnelName: "awt-quiet-test"
	}));
	fs.writeFileSync(path.join(root, "install-state.txt"), "1.0.588\n");
	writeReceipt(registered({
		lastServerMessageAt: new Date(Date.now() - 10 * 60 * 1000).toISOString()
	}));
	assert.equal(invoke('supervisor_receipt_matches "4242" "90000"').status, 1);
	assert.equal(invoke('supervisor_registered_receipt_matches "4242"').status, 0);
	assert.equal(reason(), "registration_receipt_stale");

	writeReceipt(registered({ state: "reconnecting" }));
	assert.equal(invoke('supervisor_registered_receipt_matches "4242"').status, 1);
	writeReceipt(registered({ runtimeVersion: "1.0.587" }));
	assert.equal(invoke('supervisor_registered_receipt_matches "4242"').status, 1);
	writeReceipt(registered({ pid: 9999 }));
	assert.equal(invoke('supervisor_registered_receipt_matches "4242"').status, 1);

	console.log(JSON.stringify({
		ok: true,
		suite: "supervisor-quiet-registration",
		initialFreshnessPreserved: true,
		quietSteadyRegistrationPreserved: true,
		explicitStateDriftRejected: true
	}, null, 2));
} finally {
	fs.rmSync(root, { recursive: true, force: true });
}

function registered(overrides = {}) {
	const now = new Date().toISOString();
	return {
		state: "registered",
		pid: 4242,
		tunnelName: "awt-quiet-test",
		tunnelId: "tun_quiet",
		runtimeVersion: "1.0.588",
		updatedAt: now,
		lastServerMessageAt: now,
		...overrides
	};
}

function writeReceipt(value) {
	fs.writeFileSync(path.join(root, "connection-state.json"), JSON.stringify(value));
}

function reason() {
	return invoke('supervisor_receipt_failure_reason "4242" "90000"').stdout.trim();
}

function invoke(command) {
	const environment = { ...process.env };
	delete environment.AWTSMOOS_ACTIVATION_ID;
	return spawnSync("bash", ["-c", [
		"set -u",
		'ROOT="$TEST_ROOT"',
		'source "$RECEIPT_SOURCE"',
		command
	].join("\n")], {
		encoding: "utf8",
		env: { ...environment, TEST_ROOT: root, RECEIPT_SOURCE: receiptSource }
	});
}
