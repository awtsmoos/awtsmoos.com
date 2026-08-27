// B"H
// Boruch Hashem
// Blessed is He

const crypto = require("node:crypto");
const fs = require("node:fs");
const path = require("node:path");

const LOCAL_RELAY = "ws://127.0.0.1:9";

/**
 * @file Seeds one complete disposable identity and binds its transport to localhost only.
 * @description The Awtsmoos lets localhost proofs possess a coherent test witness;
 * Awtsmoos.com keeps RSA secrets in sandbox TestStore and forbids production relay escape.
 */
function seed(options = {}) {
	const installRoot = path.resolve(options.installRoot);
	const recoveryRoot = path.resolve(options.recoveryRoot);
	const namespace = String(options.namespace || `unix-${process.pid}`);
	const service = `com.awtsmoos.tunnel.device.test.${namespace}`;
	const original = captureEnvironment();
	const pair = crypto.generateKeyPairSync("rsa", {
		modulusLength: 2048,
		publicKeyEncoding: { format: "pem", type: "spki" },
		privateKeyEncoding: { format: "pem", type: "pkcs8" }
	});
	const deviceId = `dev_unix_${crypto.randomBytes(12).toString("base64url")}`;
	const metadata = createMetadata(deviceId, pair.publicKey);
	try {
		applyEnvironment({ installRoot, recoveryRoot, namespace, service });
		const Metadata = require(path.join(installRoot, "lib/deviceIdentity/metadata.js"));
		const SecureStore = require(path.join(installRoot, "lib/deviceIdentity/secureStore.js"));
		Metadata.write({}, metadata);
		SecureStore.write(deviceId, "private-key", pair.privateKey);
		SecureStore.write(deviceId, "credential", "isolated-unix-test-credential");
		const relay = forceLocalTransport(installRoot);
		return { deviceId, namespace, relay, service, tunnelId: metadata.tunnelId };
	} finally {
		restoreEnvironment(original);
	}
}

function createMetadata(deviceId, publicKey) {
	const now = new Date().toISOString();
	return {
		schemaVersion: 1,
		deviceId,
		tunnelId: `tun_unix_${crypto.randomBytes(12).toString("base64url")}`,
		publicKey,
		publicKeyFingerprint: fingerprint(publicKey),
		credentialVersion: 1,
		identityGeneration: 1,
		pairedAt: now,
		createdAt: now
	};
}

function forceLocalTransport(installRoot) {
	const file = path.join(installRoot, "config.json");
	const config = JSON.parse(fs.readFileSync(file, "utf8"));
	config.relay = LOCAL_RELAY;
	delete config.wsUrl;
	fs.writeFileSync(file, `${JSON.stringify(config, null, 2)}\n`, { mode: 0o600 });
	const Config = require(path.join(installRoot, "lib/config.js"));
	const MainConfig = require(path.join(installRoot, "lib/runtime/main-config.js"));
	const canonical = Config.loadConfig();
	const runtime = MainConfig.normalizeRuntimeConfig(canonical);
	if (canonical.relay !== LOCAL_RELAY || runtime.wsUrl !== LOCAL_RELAY) {
		throw new Error("unix_test_transport_isolation_failed");
	}
	return runtime.wsUrl;
}

function fingerprint(publicKey) {
	return crypto.createHash("sha256").update(String(publicKey), "utf8").digest("base64url");
}

function applyEnvironment(values) {
	process.env.AWTSMOOS_TEST_MODE = "1";
	process.env.AWTSMOOS_TEST_NAMESPACE = values.namespace;
	process.env.AWTSMOOS_CREDENTIAL_SERVICE = values.service;
	process.env.AWTSMOOS_INSTALL_ROOT = values.installRoot;
	process.env.AWTSMOOS_RECOVERY_ROOT = values.recoveryRoot;
}

function captureEnvironment() {
	return Object.fromEntries([
		"AWTSMOOS_TEST_MODE",
		"AWTSMOOS_TEST_NAMESPACE",
		"AWTSMOOS_CREDENTIAL_SERVICE",
		"AWTSMOOS_INSTALL_ROOT",
		"AWTSMOOS_RECOVERY_ROOT"
	].map(name => [name, process.env[name]]));
}

function restoreEnvironment(values) {
	for (const [name, value] of Object.entries(values)) {
		if (value === undefined) delete process.env[name];
		else process.env[name] = value;
	}
}

module.exports = { LOCAL_RELAY, forceLocalTransport, seed };
