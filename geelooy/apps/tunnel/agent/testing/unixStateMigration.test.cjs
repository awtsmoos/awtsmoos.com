// B"H
// Boruch Hashem
// Blessed is He

const assert = require("node:assert/strict");
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");
const { spawnSync } = require("node:child_process");

const sandbox = fs.mkdtempSync(path.join(os.tmpdir(), "awts-state-migration-"));
const root = path.join(sandbox, "runtime");
const recovery = path.join(sandbox, "recovery");
const downloads = path.resolve(__dirname, "../../downloads");

/**
	* @file Exercises dynamic-state migration with production dependency order.
	* @description
	* The Awtsmoos moves device identity and browser memory outside runtime code;
	* Awtsmoos.com protects a populated destination from destructive merging.
	*/
try {
	prepareLegacyState();
	runMigration();
	const durable = path.join(recovery, "state", "chrome-profile");
	assert.equal(fs.existsSync(path.join(root, "chrome-profile")), false);
	assert.equal(fs.readFileSync(path.join(durable, "Default", "Cookies"), "utf8"), "first");
	const config = JSON.parse(fs.readFileSync(path.join(root, "config.json"), "utf8"));
	assert.equal(config.chrome.userDataDir, durable);
	const identity = JSON.parse(fs.readFileSync(
		path.join(recovery, "state", "device-binding.json"),
		"utf8"
	));
	assert.equal(identity.deviceId, "dev_state_migration_test");
	const receipt = JSON.parse(fs.readFileSync(
		path.join(recovery, "state", "profile-migration.json"),
		"utf8"
	));
	assert.equal(receipt.state, "completed");
	const job = path.join(root, "device-state", "device-a", ".Awtsmoos", "command-jobs", "job-a", "meta.json");
	fs.mkdirSync(path.dirname(job), { recursive: true });
	fs.writeFileSync(job, JSON.stringify({ jobId: "job-a", status: "running" }));
	runStoppedRuntimeMigration();
	const durableJob = path.join(
		recovery,
		"state",
		"device-state",
		"device-a",
		".Awtsmoos",
		"command-jobs",
		"job-a",
		"meta.json"
	);
	assert.equal(JSON.parse(fs.readFileSync(durableJob, "utf8")).status, "running");
	assert.equal(fs.lstatSync(path.join(root, "device-state")).isSymbolicLink(), true);
	assert.equal(
		fs.realpathSync(path.join(root, "device-state")),
		fs.realpathSync(path.join(recovery, "state", "device-state"))
	);
	const deviceReceipt = JSON.parse(fs.readFileSync(
		path.join(recovery, "state", "device-state-migration.json"),
		"utf8"
	));
	assert.equal(deviceReceipt.state, "completed");

	fs.mkdirSync(path.join(root, "chrome-profile"), { recursive: true });
	fs.writeFileSync(path.join(root, "chrome-profile", "second.txt"), "second");
	runMigration();
	const legacy = fs.readdirSync(path.join(recovery, "state"))
		.find(name => name.startsWith("chrome-profile-legacy-"));
	assert.ok(legacy);
	assert.equal(
		fs.readFileSync(path.join(recovery, "state", legacy, "second.txt"), "utf8"),
		"second"
	);
	assert.equal(fs.readFileSync(path.join(durable, "Default", "Cookies"), "utf8"), "first");

	console.log(JSON.stringify({
		ok: true,
		suite: "unix-state-migration",
		identityBackedUp: true,
		durableJobsPreserved: true,
		durableStateLinked: true,
		legacyMoved: true,
		configUpdated: true,
		populatedDestinationProtected: true
	}, null, 2));
} finally {
	fs.rmSync(sandbox, { recursive: true, force: true });
}

function prepareLegacyState() {
	fs.mkdirSync(path.join(root, "chrome-profile", "Default"), { recursive: true });
	fs.writeFileSync(path.join(root, "chrome-profile", "Default", "Cookies"), "first");
	fs.writeFileSync(path.join(root, "config.json"), JSON.stringify({
		chrome: { userDataDir: path.join(root, "chrome-profile") }
	}));
	fs.writeFileSync(path.join(root, "device-binding.json"), JSON.stringify({
		deviceId: "dev_state_migration_test",
		tunnelId: "tun_state_migration_test"
	}));
}

function runMigration() {
	const result = spawnSync("bash", ["-c", `set -Eeuo pipefail
ROOT="$1"
RECOVERY_ROOT="$2"
DOWNLOADS="$3"
install_event(){ :; }
source "$DOWNLOADS/unix-device-identity-state.sh"
source "$DOWNLOADS/unix-state-migration.sh"
migrate_dynamic_state
`, "--", root, recovery, downloads], { encoding: "utf8" });
	assert.equal(result.status, 0, `${result.stdout}\n${result.stderr}`);
}

function runStoppedRuntimeMigration() {
	const result = spawnSync("bash", ["-c", `set -Eeuo pipefail
ROOT="$1"
RECOVERY_ROOT="$2"
DOWNLOADS="$3"
install_event(){ :; }
install_fail(){ printf '%s\\n' "$*" >&2; return 1; }
source "$DOWNLOADS/unix-state-migration.sh"
migrate_runtime_device_state "$ROOT"
`, "--", root, recovery, downloads], { encoding: "utf8" });
	assert.equal(result.status, 0, `${result.stdout}\n${result.stderr}`);
}
