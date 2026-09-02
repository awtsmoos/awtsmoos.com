// B"H
// Boruch Hashem
// Blessed is He

const assert = require("node:assert/strict");
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");
const { spawnSync } = require("node:child_process");

/**
 * @file Proves modular recovery overlays archived identity with the newest validated witness.
 * @description
 * The Awtsmoos renews code from an older world while keeping the present device soul;
 * Awtsmoos.com sources validation, identity, then candidates as rescue does, so modular truth stays whole.
 */
const downloads = path.resolve(__dirname, "../../downloads");
const scripts = {
	validation: path.join(downloads, "unix-recovery-validation.sh"),
	identity: path.join(downloads, "unix-recovery-identity.sh"),
	candidates: path.join(downloads, "unix-recovery-candidates.sh")
};
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
	runOverlay(scripts, live, recovery, stage);
	assertIdentity(stage, "dev_live", "tun_current");
	assert.equal(fs.readFileSync(path.join(stage, "config.json"), "utf8"),
		'{"root":"/present"}\n');

	fs.rmSync(path.join(live, "device-binding.json"));
	writeIdentity(path.join(stage, "device-binding.json"), "archive", "old");
	runOverlay(scripts, live, recovery, stage);
	assertIdentity(stage, "dev_backup", "tun_backup");
	assert.equal(fs.statSync(path.join(stage, "device-binding.json")).mode & 0o777, 0o600);
	console.log(JSON.stringify({
		ok: true,
		suite: "recovery-identity-restore",
		modularComposition: true,
		liveIdentityPreferred: true,
		externalBackupFallback: true,
		archivedIdentitySuperseded: true,
		permissionsRestricted: true
	}, null, 2));
} finally {
	fs.rmSync(root, { recursive: true, force: true });
}

function runOverlay(selected, liveRoot, recoveryRoot, stageRoot) {
	const result = spawnSync("bash", ["-c", `set -Eeuo pipefail
ROOT="$TEST_LIVE"
RECOVERY_ROOT="$TEST_RECOVERY"
STAGE="$TEST_STAGE"
TIER=0
LOG="$TEST_RECOVERY/logs/recovery.jsonl"
source "$TEST_VALIDATION"
source "$TEST_IDENTITY"
source "$TEST_CANDIDATES"
copy_recovery_mutable_state`], {
		encoding: "utf8",
		env: {
			...process.env,
			AWTSMOOS_NODE_BIN: process.execPath,
			TEST_LIVE: liveRoot,
			TEST_RECOVERY: recoveryRoot,
			TEST_STAGE: stageRoot,
			TEST_VALIDATION: selected.validation,
			TEST_IDENTITY: selected.identity,
			TEST_CANDIDATES: selected.candidates
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

function assertIdentity(stageRoot, deviceId, tunnelId) {
	const value = JSON.parse(fs.readFileSync(path.join(stageRoot, "device-binding.json"), "utf8"));
	assert.equal(value.deviceId, deviceId);
	assert.equal(value.tunnelId, tunnelId);
}
