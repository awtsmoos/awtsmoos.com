// B"H
// Boruch Hashem
// Blessed is He

const assert = require("node:assert/strict");
const crypto = require("node:crypto");
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");
const test = require("node:test");

const sandbox = fs.mkdtempSync(path.join(os.tmpdir(), "awtsmoos-identity-repair-"));
const installRoot = path.join(sandbox, "runtime");
const recoveryRoot = path.join(sandbox, "recovery");
process.env.AWTSMOOS_INSTALL_ROOT = installRoot;
process.env.AWTSMOOS_RECOVERY_ROOT = recoveryRoot;
process.env.AWTSMOOS_TEST_MODE = "1";
process.env.AWTSMOOS_TEST_NAMESPACE = `repair-${process.pid}`;

const Identity = require("../lib/deviceIdentity/index.js");
const PairingClient = require("../lib/deviceIdentity/pairingClient.js");
const Secrets = require("../../../../api/tunnel/control/core/tunnelSecurity/secrets.js");

function keyPair() {
	return crypto.generateKeyPairSync("rsa", {
		modulusLength: 2048,
		publicKeyEncoding: { format: "pem", type: "spki" },
		privateKeyEncoding: { format: "pem", type: "pkcs8" }
	});
}

test("a poisoned identity is quarantined and fresh pairing succeeds", async () => {
	const publicGeneration = keyPair();
	const privateGeneration = keyPair();
	const broken = Identity.Metadata.write({}, {
		deviceId: "dev_broken_generation",
		tunnelId: "tun_stale",
		publicKey: publicGeneration.publicKey,
		publicKeyFingerprint: Identity.KeyCoherence.fingerprint(publicGeneration.publicKey),
		pairedAt: new Date().toISOString(),
		credentialVersion: 4,
		createdAt: new Date().toISOString()
	});
	Identity.SecureStore.write(broken.deviceId, "private-key", privateGeneration.privateKey);
	Identity.SecureStore.write(broken.deviceId, "credential", "stale-credential");
	Identity.SecureStore.write(broken.deviceId, "pairing-request-secret", "stale-pending");

	let wirePublicKey = "";
	let repairs = 0;
	const originals = {
		request: PairingClient.request,
		status: PairingClient.status,
		approvalUrl: PairingClient.approvalUrl
	};
	PairingClient.request = async (_config, payload) => {
		wirePublicKey = payload.devicePublicKey;
		return {
			pairingId: "pair_fresh",
			userCode: "FRESH123",
			requestSecret: "fresh-secret",
			expiresAt: Date.now() + 60000
		};
	};
	PairingClient.approvalUrl = () => "https://example.test/fresh";
	PairingClient.status = async () => ({
		state: "approved",
		tunnelId: "tun_fresh",
		credentialEnvelope: Secrets.encryptForDevice(wirePublicKey, "fresh-credential")
	});

	try {
		const result = await Identity.pair(
			{ installRoot, tunnelName: "awt-repaired" },
			{
				openBrowser: false,
				pollIntervalMs: 1,
				onIdentityRepair: () => repairs++
			}
		);
		assert.equal(result.ok, true);
		assert.equal(repairs, 1);
		assert.notEqual(result.deviceId, broken.deviceId);
		assert.equal(Identity.SecureStore.read(broken.deviceId, "private-key"), null);
		assert.equal(Identity.SecureStore.read(broken.deviceId, "credential"), null);
		const loaded = Identity.load({ installRoot });
		assert.equal(loaded.ok, true);
		assert.equal(loaded.deviceCredential, "fresh-credential");
		const evidence = fs.readdirSync(path.join(
			recoveryRoot,
			"diagnostics",
			"identity-quarantine"
		));
		assert.equal(evidence.length, 1);
		const text = fs.readFileSync(path.join(
			recoveryRoot,
			"diagnostics",
			"identity-quarantine",
			evidence[0]
		), "utf8");
		assert.doesNotMatch(text, /stale-credential|PRIVATE KEY/);
	} finally {
		Object.assign(PairingClient, originals);
	}
});

test.after(() => fs.rmSync(sandbox, { recursive: true, force: true }));
