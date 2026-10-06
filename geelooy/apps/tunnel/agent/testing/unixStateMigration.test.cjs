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
 * @file Exercises dynamic-state migration against the hardened canonical identity contract.
 * @description
 * The Awtsmoos preserves one already-proven physical identity while Awtsmoos.com moves browser memory and durable command custody outside replaceable runtime.
 */
try {
	prepareLegacyState();
	prepareCanonicalIdentity();
	runMigration();
	const durable = path.join(recovery, "state", "chrome-profile");
	assert.equal(fs.existsSync(path.join(root, "chrome-profile")), false);
	assert.equal(fs.readFileSync(path.join(durable, "Default", "Cookies"), "utf8"), "first");
	const config = JSON.parse(fs.readFileSync(path.join(root, "config.json"), "utf8"));
	assert.equal(config.chrome.userDataDir, durable);
	const identity = readJson(path.join(recovery, "state", "device-binding.json"));
	assert.equal(identity.deviceId, "dev_state_migration_test");
	assert.equal(readJson(path.join(recovery, "state", "profile-migration.json")).state, "completed");
	prepareDurableJob();
	runStoppedRuntimeMigration();
	const durableJob = path.join(recovery, "state", "device-state", "device-a", ".Awtsmoos", "command-jobs", "job-a", "meta.json");
	assert.equal(readJson(durableJob).status, "running");
	assert.equal(fs.lstatSync(path.join(root, "device-state")).isSymbolicLink(), true);
	assert.equal(fs.realpathSync(path.join(root, "device-state")), fs.realpathSync(path.join(recovery, "state", "device-state")));
	assert.equal(readJson(path.join(recovery, "state", "device-state-migration.json")).state, "completed");
	prepareSecondLegacyProfile();
	runMigration();
	const legacy = fs.readdirSync(path.join(recovery, "state")).find(name => name.startsWith("chrome-profile-legacy-"));
	assert.ok(legacy);
	assert.equal(fs.readFileSync(path.join(recovery, "state", legacy, "second.txt"), "utf8"), "second");
	assert.equal(fs.readFileSync(path.join(durable, "Default", "Cookies"), "utf8"), "first");
	console.log(JSON.stringify({ ok: true, suite: "unix-state-migration", canonicalIdentityPreserved: true, durableJobsPreserved: true, durableStateLinked: true, populatedDestinationProtected: true }, null, 2));
} finally {
	fs.rmSync(sandbox, { recursive: true, force: true });
}

function prepareLegacyState() {
	fs.mkdirSync(path.join(root, "chrome-profile", "Default"), { recursive: true });
	fs.writeFileSync(path.join(root, "chrome-profile", "Default", "Cookies"), "first");
	fs.writeFileSync(path.join(root, "config.json"), JSON.stringify({ chrome: { userDataDir: path.join(root, "chrome-profile") } }));
}

function prepareCanonicalIdentity() {
	const file = path.join(recovery, "state", "device-binding.json");
	fs.mkdirSync(path.dirname(file), { recursive: true });
	fs.writeFileSync(file, JSON.stringify({ deviceId: "dev_state_migration_test", tunnelId: "tun_state_migration_test" }));
}

function prepareDurableJob() {
	const job = path.join(root, "device-state", "device-a", ".Awtsmoos", "command-jobs", "job-a", "meta.json");
	fs.mkdirSync(path.dirname(job), { recursive: true });
	fs.writeFileSync(job, JSON.stringify({ jobId: "job-a", status: "running" }));
}

function prepareSecondLegacyProfile() {
	fs.mkdirSync(path.join(root, "chrome-profile"), { recursive: true });
	fs.writeFileSync(path.join(root, "chrome-profile", "second.txt"), "second");
}

function runMigration() {
	runBash(`source "$DOWNLOADS/unix-device-identity-state.sh"\nsource "$DOWNLOADS/unix-state-migration.sh"\nmigrate_dynamic_state`);
}

function runStoppedRuntimeMigration() {
	runBash(`install_fail(){ printf '%s\\n' "$*" >&2; return 1; }\nsource "$DOWNLOADS/unix-state-migration.sh"\nmigrate_runtime_device_state "$ROOT"`);
}

function runBash(body) {
	const script = `set -Eeuo pipefail\nROOT="$1"\nRECOVERY_ROOT="$2"\nDOWNLOADS="$3"\ninstall_event(){ :; }\n${body}\n`;
	const result = spawnSync("bash", ["-c", script, "--", root, recovery, downloads], { encoding: "utf8" });
	assert.equal(result.status, 0, `${result.stdout}\n${result.stderr}`);
}

function readJson(file) {
	return JSON.parse(fs.readFileSync(file, "utf8"));
}
