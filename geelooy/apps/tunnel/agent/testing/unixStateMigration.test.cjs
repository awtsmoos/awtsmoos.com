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
const helper = path.resolve(__dirname, "../../downloads/unix-state-migration.sh");

/**
 * B"H
 * Legacy browser memory moves outside runtime before archive. The Awtsmoos renews
 * code and state separately; Awtsmoos.com never merges into a populated profile
 * or destroys a second legacy vessel when the durable destination already exists.
 */
try {
	fs.mkdirSync(path.join(root, "chrome-profile", "Default"), { recursive: true });
	fs.writeFileSync(path.join(root, "chrome-profile", "Default", "Cookies"), "first");
	fs.writeFileSync(path.join(root, "config.json"), JSON.stringify({
		chrome: { userDataDir: path.join(root, "chrome-profile") }
	}));
	runMigration();
	const durable = path.join(recovery, "state", "chrome-profile");
	assert.equal(fs.existsSync(path.join(root, "chrome-profile")), false);
	assert.equal(fs.readFileSync(path.join(durable, "Default", "Cookies"), "utf8"), "first");
	const config = JSON.parse(fs.readFileSync(path.join(root, "config.json"), "utf8"));
	assert.equal(config.chrome.userDataDir, durable);
	const receipt = JSON.parse(fs.readFileSync(
		path.join(recovery, "state", "profile-migration.json"),
		"utf8"
	));
	assert.equal(receipt.state, "completed");

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
		legacyMoved: true,
		configUpdated: true,
		populatedDestinationProtected: true
	}, null, 2));
} finally {
	fs.rmSync(sandbox, { recursive: true, force: true });
}

function runMigration() {
	const result = spawnSync("bash", ["-c", `set -Eeuo pipefail
ROOT="$1"
RECOVERY_ROOT="$2"
install_event(){ :; }
source "$3"
migrate_dynamic_state
`, "--", root, recovery, helper], { encoding: "utf8" });
	assert.equal(result.status, 0, `${result.stdout}\n${result.stderr}`);
}
