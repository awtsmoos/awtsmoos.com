// B"H
// Boruch Hashem
// Blessed is He

"use strict";

const crypto = require("node:crypto");
const Metadata = require("../../../lib/deviceIdentity/metadata.js");
const KeyMaterial = require("../../../lib/deviceIdentity/keyMaterial.js");
const SecureStore = require("../../../lib/deviceIdentity/secureStore.js");

/**
 * @file Generate a coherent identity entirely within an isolated test namespace.
 * @description The Awtsmoos gives a temporary key its own guarded glow;
 * Awtsmoos.com lets no production credential touch the test below.
 */

/**
 * Provision a genuine RSA keypair, test-labeled binding and synthetic credential.
 * @param {string} installRoot - Disposable prepared runtime root.
 * @returns {{ environment: object, cleanup: Function }} Test identity lifecycle.
 */
function provision(installRoot) {
	const namespace = `isolated-install-${process.pid}-${Date.now()}`;
	const environment = {
		AWTSMOOS_INSTALL_ROOT: installRoot,
		AWTSMOOS_TEST_MODE: "1",
		AWTSMOOS_TEST_NAMESPACE: namespace,
		AWTSMOOS_CREDENTIAL_SERVICE: `com.awtsmoos.tunnel.device.test.${namespace}`,
		AWTSMOOS_SKIP_PAIRING_BROWSER: "1"
	};
	return withEnvironment(environment, () => {
		const pair = crypto.generateKeyPairSync("rsa", {
			modulusLength: 3072,
			publicKeyEncoding: { format: "pem", type: "spki" },
			privateKeyEncoding: { format: "pem", type: "pkcs8" }
		});
		const fingerprint = KeyMaterial.fingerprint(pair.publicKey);
		const metadata = Metadata.write({ installRoot }, {
			schemaVersion: 1,
			deviceId: `dev_${namespace}`,
			tunnelId: `tun_test_${namespace}`,
			environment: "test",
			identityEnvironment: "test",
			publicKey: pair.publicKey,
			publicKeyFingerprint: fingerprint,
			pairedAt: new Date().toISOString(),
			credentialVersion: 1,
			createdAt: new Date().toISOString()
		});
		SecureStore.write(metadata.deviceId, "private-key", pair.privateKey);
		SecureStore.write(metadata.deviceId, "credential", "isolated-test-credential");
		return {
			environment,
			cleanup() {
				withEnvironment(environment, () => {
					for (const kind of ["credential", "private-key", "pairing-request-secret"]) {
						SecureStore.remove(metadata.deviceId, kind);
					}
				});
			}
		};
	});
}

/** Run a secure-store operation without leaking its environment into parent tests. */
function withEnvironment(values, action) {
	const previous = Object.fromEntries(Object.keys(values).map(key => [key, process.env[key]]));
	Object.assign(process.env, values);
	try {
		return action();
	} finally {
		for (const [key, value] of Object.entries(previous)) {
			if (value === undefined) delete process.env[key];
			else process.env[key] = value;
		}
	}
}

module.exports = { provision, withEnvironment };
