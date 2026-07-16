// B"H
// Boruch Hashem
// Blessed is He

const assert = require("node:assert/strict");
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");
const { spawnSync } = require("node:child_process");

/**
 * @file Proves reinstall restores the same account-bound device identity.
 * @description
 * The Awtsmoos renews runtime code without replacing the device essence. Awtsmoos.com
 * backs validated metadata outside the live tree, restores it when the tree vanishes,
 * and never promotes malformed or symlinked testimony into a candidate release.
 */
const repositoryRoot = path.resolve(__dirname, "../../../../..");
const downloads = path.join(repositoryRoot, "geelooy/apps/tunnel/downloads");
const sandbox = fs.mkdtempSync(path.join(os.tmpdir(), "awts-identity-preserve-"));
const root = path.join(sandbox, "live");
const recovery = path.join(sandbox, "recovery");
const candidate = path.join(sandbox, "candidate");
fs.mkdirSync(root);
fs.mkdirSync(candidate);
const identity = {
	schemaVersion: 1,
	deviceId: "dev_identity_preserved",
	tunnelId: "tun_identity_preserved",
	publicKeyFingerprint: "fingerprint",
	credentialVersion: 1
};
fs.writeFileSync(
	path.join(root, "device-binding.json"),
	`${JSON.stringify(identity, null, 2)}\n`,
	{ mode: 0o600 }
);

try {
	const result = spawnSync("bash", ["-c", script()], {
		encoding: "utf8",
		env: {
			...process.env,
			ROOT: root,
			RECOVERY_ROOT: recovery,
			CANDIDATE: candidate,
			DOWNLOADS: downloads
		}
	});
	assert.equal(result.status, 0, `${result.stdout}\n${result.stderr}`);
	const restored = JSON.parse(fs.readFileSync(
		path.join(candidate, "device-binding.json"),
		"utf8"
	));
	assert.deepEqual(restored, identity);
	assert.deepEqual(JSON.parse(fs.readFileSync(
		path.join(recovery, "state/device-binding.json"),
		"utf8"
	)), identity);
	assert.equal(
		fs.statSync(path.join(candidate, "device-binding.json")).mode & 0o777,
		0o600
	);
	console.log(JSON.stringify({
		ok: true,
		suite: "installer-identity-preservation",
		liveIdentityBackedUp: true,
		missingLiveIdentityRestored: true,
		permissionsRestricted: true
	}, null, 2));
} finally {
	fs.rmSync(sandbox, { recursive: true, force: true });
}

function script() {
	return `set -Eeuo pipefail
install_event(){ :; }
source "$DOWNLOADS/unix-device-identity-state.sh"
source "$DOWNLOADS/unix-package-config.sh"
backup_device_identity
rm -f "$ROOT/device-binding.json"
copy_candidate_identity "$CANDIDATE"
validate_device_identity_file "$CANDIDATE/device-binding.json"`;
}
