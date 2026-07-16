// B"H

const assert = require("node:assert/strict");
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");

process.env.AWTSMOOS_TEST_MODE = "1";
process.env.AWTSMOOS_TEST_NAMESPACE = `pair-resume-${process.pid}`;
process.env.AWTSMOOS_INSTALL_ROOT = fs.mkdtempSync(
	path.join(os.tmpdir(), "awtsmoos-pair-resume-")
);

const Metadata = require("../lib/deviceIdentity/metadata.js");
const KeyMaterial = require("../lib/deviceIdentity/keyMaterial.js");
const PairingClient = require("../lib/deviceIdentity/pairingClient.js");
const SecureStore = require("../lib/deviceIdentity/secureStore.js");
const Pairing = require("../lib/deviceIdentity/pairingWorkflow.js");

const originals = {
	ensure: KeyMaterial.ensure,
	decrypt: KeyMaterial.decryptCredential,
	request: PairingClient.request,
	status: PairingClient.status,
	approvalUrl: PairingClient.approvalUrl,
	read: SecureStore.read,
	write: SecureStore.write,
	remove: SecureStore.remove
};
const secrets = new Map();
let requests = 0;
let statusCalls = 0;
let browserOpens = 0;

SecureStore.read = (deviceId, kind) => secrets.get(`${deviceId}:${kind}`) || null;
SecureStore.write = (deviceId, kind, value) => secrets.set(`${deviceId}:${kind}`, value);
SecureStore.remove = (deviceId, kind) => secrets.delete(`${deviceId}:${kind}`);
KeyMaterial.ensure = (config) => ({
	metadata: Metadata.loadOrCreate(config),
	privateKey: "private-test",
	publicKey: "public-test"
});
KeyMaterial.wirePublicKey = () => "wire-test";
KeyMaterial.decryptCredential = () => "credential-test";
PairingClient.request = async () => {
	requests++;
	return {
		pairingId: "pair_test_resume",
		userCode: "ABCD1234",
		requestSecret: "request-secret",
		expiresAt: Date.now() + 60000
	};
};
PairingClient.approvalUrl = () => "https://example.test/approve";
PairingClient.status = async () => {
	statusCalls++;
	if (statusCalls === 1) throw new Error("simulated_process_crash");
	return { state: "approved", credentialEnvelope: "envelope", tunnelId: "tun_test" };
};

(async () => {
	const config = { installRoot: process.env.AWTSMOOS_INSTALL_ROOT, tunnelName: "awt-test" };
	await assert.rejects(
		Pairing.pair(config, { openUrl: () => browserOpens++ }),
		/simulated_process_crash/
	);
	const result = await Pairing.pair(config, { openUrl: () => browserOpens++ });
	assert.equal(result.ok, true);
	assert.equal(requests, 1, "restart must reuse the pending pairing request");
	assert.equal(browserOpens, 1, "restart must not open another approval tab");
	assert.equal(SecureStore.read(Metadata.read(config).deviceId, "pairing-request-secret"), null);
	assert.equal(SecureStore.read(Metadata.read(config).deviceId, "credential"), "credential-test");
	console.log(JSON.stringify({ ok: true, suite: "pairing-resume-single-browser" }));
})().finally(() => {
	Object.assign(KeyMaterial, { ensure: originals.ensure, decryptCredential: originals.decrypt });
	Object.assign(PairingClient, {
		request: originals.request,
		status: originals.status,
		approvalUrl: originals.approvalUrl
	});
	Object.assign(SecureStore, {
		read: originals.read,
		write: originals.write,
		remove: originals.remove
	});
	fs.rmSync(process.env.AWTSMOOS_INSTALL_ROOT, { recursive: true, force: true });
}).catch((error) => {
	console.error(error);
	process.exitCode = 1;
});
