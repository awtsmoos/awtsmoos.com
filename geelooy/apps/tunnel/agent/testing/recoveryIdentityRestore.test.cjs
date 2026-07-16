// B"H
// Boruch Hashem
// Blessed is He

const assert = require("node:assert/strict");
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");
const { spawnSync } = require("node:child_process");

/**
 * @file Proves recovery overlays archived identity with the newest validated witness.
 * @description
 * The Awtsmoos renews code from an older world while keeping the present device soul.
 * Awtsmoos.com prefers live metadata, falls back to external recovery state, restricts
 * permissions, and never revives an obsolete tunnel ID merely because code rolled back.
 */
const repositoryRoot = path.resolve(__dirname, "../../../../..");
const script = path.join(
	repositoryRoot,
	"geelooy/apps/tunnel/downloads/unix-recovery-candidates.sh"
);
const root = fs.mkdtempSync(path.join(os.tmpdir(), "awts-recovery-identity-"));
const live = path.join(root, "live");
const recovery = path.join(root, "recovery");
const stage = path.join(root, "stage");
fs.mkdirSync(live);
fs.mkdirSync(path.join(recovery, "state"), { recursive: true });
fs.mkdirSync(stage);
try {
	writeIdentity(path.join(stage, "device-binding.json"), "archive", "old");
	writeIdentity(path.join(recovery, "state/device-binding.json"), "backup", "backup");
	writeIdentity(path.join(live, "device-binding.json"), "live", "current");
	fs.writeFileSync(path.join(live, "config.json"), '{"root":"/present"}\n');
	runOverlay(script, live, recovery, stage);
	assertIdentity(stage, "dev_live", "tun_current");
	assert.equal(fs.readFileSync(path.join(stage, "config.json"), "utf8"),
		'{"root":"/present"}\n');

	fs.rmSync(path.join(live, "device-binding.json"));
	writeIdentity(path.join(stage, "device-binding.json"), "archive", "old");
	runOverlay(script, live, recovery, stage);
	assertIdentity(stage, "dev_backup", "tun_backup");
	assert.equal(fs.statSync(path.join(stage, "device-binding.json")).mode & 0o777, 0o600);
	console.log(JSON.stringify({
		ok: true,
		suite: "recovery-identity-restore",
		liveIdentityPreferred: true,
		externalBackupFallback: true,
		archivedIdentitySuperseded: true,
		permissionsRestricted: true
	}, null, 2));
} finally {
	fs.rmSync(root, { recursive: true, force: true });
}

function runOverlay(script, live, recovery, stage) {
	const result = spawnSync("bash", ["-c", `set -Eeuo pipefail
ROOT="$TEST_LIVE"
RECOVERY_ROOT="$TEST_RECOVERY"
STAGE="$TEST_STAGE"
source "$TEST_SCRIPT"
copy_recovery_mutable_state`], {
		encoding: "utf8",
		env: {
			...process.env,
			TEST_LIVE: live,
			TEST_RECOVERY: recovery,
			TEST_STAGE: stage,
			TEST_SCRIPT: script
		}
	});
	assert.equal(result.status, 0, `${result.stdout}\n${result.stderr}`);
}

function writeIdentity(file, device, tunnel) {
	fs.writeFileSync(file, `${JSON.stringify({
		deviceId: `dev_${device}`,
		tunnelId: `tun_${tunnel}`,
		publicKeyFingerprint: `${device}-fingerprint`
	}, null, 2)}\n`);
}

function assertIdentity(stage, deviceId, tunnelId) {
	const value = JSON.parse(fs.readFileSync(path.join(stage, "device-binding.json"), "utf8"));
	assert.equal(value.deviceId, deviceId);
	assert.equal(value.tunnelId, tunnelId);
}
