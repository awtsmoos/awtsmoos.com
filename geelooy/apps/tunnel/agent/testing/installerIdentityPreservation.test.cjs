// B"H
// Boruch Hashem
// Blessed is He

const assert = require("node:assert/strict");
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");
const { spawnSync } = require("node:child_process");

/**
 * @file Proves reinstall restores the canonical account-bound device identity.
 * @description
 * The Awtsmoos renews runtime code without replacing the physical device essence.
 * Awtsmoos.com treats recovery state as canonical once established; a transient or
 * foreign runtime mirror cannot outrank it merely because metadata looks stronger.
 */
const repositoryRoot = path.resolve(__dirname, "../../../../..");
const downloads = path.join(repositoryRoot, "geelooy/apps/tunnel/downloads");
const sandbox = fs.mkdtempSync(path.join(os.tmpdir(), "awts-identity-preserve-"));
const root = path.join(sandbox, "live");
const recovery = path.join(sandbox, "recovery");
const candidate = path.join(sandbox, "candidate");
const canonicalPath = path.join(recovery, "state", "device-binding.json");
const identity = {
	schemaVersion: 1,
	deviceId: "dev_identity_preserved",
	tunnelId: "tun_identity_preserved",
	publicKeyFingerprint: "canonical-fingerprint",
	credentialVersion: 1
};

fs.mkdirSync(root, { recursive: true });
fs.mkdirSync(candidate, { recursive: true });
fs.mkdirSync(path.dirname(canonicalPath), { recursive: true });
writeIdentity(canonicalPath, identity);
writeIdentity(path.join(root, "device-binding.json"), {
	...identity,
	deviceId: "dev_foreign_runtime_mirror",
	tunnelId: "tun_foreign_runtime_mirror",
	credentialVersion: 999
});

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
	const restored = readIdentity(path.join(candidate, "device-binding.json"));
	assert.deepEqual(restored, identity);
	assert.deepEqual(readIdentity(canonicalPath), identity);
	assert.deepEqual(readIdentity(path.join(root, "device-binding.json")), identity);
	assert.equal(fs.statSync(path.join(candidate, "device-binding.json")).mode & 0o777, 0o600);
	console.log(JSON.stringify({
		ok: true,
		suite: "installer-identity-preservation",
		canonicalIdentityPreserved: true,
		foreignRuntimeMirrorRejected: true,
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

function readIdentity(file) {
	return JSON.parse(fs.readFileSync(file, "utf8"));
}

function writeIdentity(file, value) {
	fs.writeFileSync(file, `${JSON.stringify(value, null, 2)}\n`, { mode: 0o600 });
}
