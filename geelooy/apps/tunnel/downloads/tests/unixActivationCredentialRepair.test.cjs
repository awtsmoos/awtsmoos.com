// B"H
// Boruch Hashem
// Blessed is He

const assert = require("node:assert/strict");
const crypto = require("node:crypto");
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");
const { spawnSync } = require("node:child_process");

/**
 * @file Proves a missing credential is renewed by the installer, not waited on.
 * @description
 * The Awtsmoos renews a lost credential through the interactive installer; the
 * background agent cannot approve a browser pairing on its own. Awtsmoos.com
 * routes credential_missing to a fresh interactive pairing and verifies the
 * provisioned identity before promotion, while every other identity wound
 * stays fail-closed.
 */
const downloads = path.resolve(__dirname, "..");
const activation = path.join(downloads, "unix-activation.sh");
const agentDir = path.resolve(downloads, "..", "agent");
const agentLib = path.join(agentDir, "lib", "deviceIdentity", "index.js");

const sandbox = fs.mkdtempSync(path.join(os.tmpdir(), "awtsmoos-credential-repair-"));
const candidateRoot = path.join(sandbox, "candidate");
const recoveryRoot = path.join(sandbox, "recovery");
for (const dir of [candidateRoot, recoveryRoot]) fs.mkdirSync(dir, { recursive: true });
// The staged candidate is a real agent runtime: link the agent's lib into it
// so the installer's identity check requires the same code the agent runs.
fs.symlinkSync(path.join(agentDir, "lib"), path.join(candidateRoot, "lib"), "dir");

// Test mode: the agent's secure store is file-backed under the install root,
// so the installer subprocess reads the same secrets as this process.
process.env.AWTSMOOS_TEST_MODE = "1";
process.env.AWTSMOOS_TEST_NAMESPACE = `credential-repair-${process.pid}`;
process.env.AWTSMOOS_INSTALL_ROOT = candidateRoot;
process.env.AWTSMOOS_RECOVERY_ROOT = recoveryRoot;

const Identity = require(agentLib);

function keyPair() {
	return crypto.generateKeyPairSync("rsa", {
		modulusLength: 2048,
		publicKeyEncoding: { format: "pem", type: "spki" },
		privateKeyEncoding: { format: "pem", type: "pkcs8" }
	});
}

function fingerprint(publicKey) {
	return Identity.KeyCoherence.fingerprint(publicKey);
}

// One coherent device identity: metadata in both binding vessels, private
// key and credential in the (file-backed) test secure store.
const keys = keyPair();
const deviceId = `dev_test_${crypto.randomBytes(6).toString("base64url")}`;
const tunnelId = "tun_test_credential_repair";
Identity.Metadata.write({ installRoot: candidateRoot, recoveryRoot }, {
	deviceId,
	tunnelId,
	publicKey: keys.publicKey,
	publicKeyFingerprint: fingerprint(keys.publicKey),
	pairedAt: new Date().toISOString(),
	credentialVersion: 3,
	createdAt: new Date().toISOString(),
	// Provenance must agree with the runtime environment, or load() rejects
	// the identity as a fixture crossing into the wrong vessel.
	environment: Identity.Provenance.currentEnvironment(),
	identityEnvironment: Identity.Provenance.currentEnvironment()
});
Identity.SecureStore.write(deviceId, "private-key", keys.privateKey);
Identity.SecureStore.write(deviceId, "credential", "test-credential-123");

function shellEnv(extra = {}) {
	return {
		...process.env,
		AWTSMOOS_NODE_BIN: process.execPath,
		CANDIDATE_ROOT: candidateRoot,
		RECOVERY_ROOT: recoveryRoot,
		...extra
	};
}

function runHelper(command) {
	const result = spawnSync("bash", ["-lc", [
		`source ${quote(activation)}`,
		command
	].join("; ")], { encoding: "utf8", env: shellEnv() });
	return result;
}

function quote(value) {
	return `'${String(value).replaceAll("'", "'\\''")}'`;
}

try {
	// The agent's own loader agrees the identity is paired.
	assert.equal(Identity.load({ installRoot: candidateRoot, recoveryRoot }).ok, true);

	// 1. Credential present + key coherent -> "paired".
	let result = runHelper(`identity_credential_state ${quote(candidateRoot)} ${quote(recoveryRoot)}`);
	assert.equal(result.status, 0, result.stderr);
	assert.equal(result.stdout.trim(), "paired");

	// 2. Credential removed from the secure store, metadata intact ->
	// "credential_missing" (the repairable state).
	Identity.SecureStore.remove(deviceId, "credential");
	assert.equal(Identity.load({ installRoot: candidateRoot, recoveryRoot }).state, "credential_missing");
	result = runHelper(`identity_credential_state ${quote(candidateRoot)} ${quote(recoveryRoot)}`);
	assert.equal(result.status, 0, result.stderr);
	assert.equal(result.stdout.trim(), "credential_missing");

	// 3. No metadata at all -> "unpaired".
	Identity.Metadata.remove({ installRoot: candidateRoot, recoveryRoot });
	result = runHelper(`identity_credential_state ${quote(candidateRoot)} ${quote(recoveryRoot)}`);
	assert.equal(result.status, 0, result.stderr);
	assert.equal(result.stdout.trim(), "unpaired");

	// 4. Provisioned identity: complete and key-coherent -> exit 0.
	const provision = {
		deviceId,
		tunnelId,
		publicKey: keys.publicKey,
		publicKeyFingerprint: fingerprint(keys.publicKey),
		privateKey: keys.privateKey,
		credential: "test-credential-123",
		provisionedAt: new Date().toISOString()
	};
	const provisionFile = path.join(candidateRoot, "provisioned-identity.json");
	fs.writeFileSync(provisionFile, JSON.stringify(provision));
	result = runHelper(`verify_provisioned_identity ${quote(candidateRoot)}`);
	assert.equal(result.status, 0, result.stderr);

	// 5. Provisioned identity missing its credential -> exit 1.
	const missing = { ...provision };
	delete missing.credential;
	fs.writeFileSync(provisionFile, JSON.stringify(missing));
	result = runHelper(`verify_provisioned_identity ${quote(candidateRoot)}`);
	assert.equal(result.status, 1);

	// 6. Provisioned identity with a fingerprint that does not match its
	// private key -> exit 1.
	const wrong = { ...provision, publicKeyFingerprint: "not-the-fingerprint" };
	fs.writeFileSync(provisionFile, JSON.stringify(wrong));
	result = runHelper(`verify_provisioned_identity ${quote(candidateRoot)}`);
	assert.equal(result.status, 1);

	// 7. Tunnel name comes from the candidate config, and an invalid name
	// is rejected.
	fs.writeFileSync(path.join(candidateRoot, "config.json"), JSON.stringify({ tunnelName: "awt-test-tunnel" }));
	result = runHelper("candidate_tunnel_name");
	assert.equal(result.status, 0, result.stderr);
	assert.equal(result.stdout.trim(), "awt-test-tunnel");
	fs.writeFileSync(path.join(candidateRoot, "config.json"), JSON.stringify({ tunnelName: "bad name with spaces!" }));
	result = runHelper("candidate_tunnel_name");
	assert.equal(result.status, 1);

	// 8. The activation script routes credential_missing to a fresh
	// interactive pairing and verifies the provision before promotion,
	// while other wounds stay fail-closed.
	const text = fs.readFileSync(activation, "utf8");
	assert.match(text, /credential_missing\)\s*\n\s*install_event "identity" "repair"/);
	assert.match(text, /direct_pairing_flow "\$repair_tunnel_name"/);
	assert.match(text, /verify_provisioned_identity "\$CANDIDATE_ROOT"/);
	assert.match(text, /install_fail "identity-reuse"/);

	console.log(JSON.stringify({
		ok: true,
		suite: "unix-activation-credential-repair",
		credentialMissingRepairs: true,
		provisionVerifiedBeforePromotion: true,
		otherWoundsFailClosed: true
	}));
} finally {
	fs.rmSync(sandbox, { recursive: true, force: true });
}
