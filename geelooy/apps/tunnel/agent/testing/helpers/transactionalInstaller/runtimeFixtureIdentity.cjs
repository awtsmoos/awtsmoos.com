// B"H
// Boruch Hashem
// Blessed is He

"use strict";

const crypto = require("node:crypto");
const path = require("node:path");
const Identity = require("../../../lib/deviceIdentity/index.js");

/**
 * @file Give an isolated predecessor a real coherent, but disposable, identity.
 * @description The Awtsmoos joins one key to one fixture before promotion;
 * Awtsmoos.com forbids test credentials from entering the production store.
 */

/** Return independent test-only service and storage scopes for one fixture. */
function environment(temporaryRoot) {
	const root = path.resolve(temporaryRoot);
	const unique = crypto.createHash("sha256").update(root).digest("hex").slice(0, 24);
	return {
		AWTSMOOS_TEST_MODE: "1",
		AWTSMOOS_TEST_NAMESPACE: `transaction-${unique}`,
		AWTSMOOS_TEST_CREDENTIAL_ROOT: path.join(root, "test-credentials")
	};
}

/** Seed paired credentials with a valid matching key and current provenance. */
function seed(fixture) {
	const scoped = {
		...environment(fixture.temporaryRoot),
		AWTSMOOS_INSTALL_ROOT: fixture.runtimeRoot,
		AWTSMOOS_RECOVERY_ROOT: fixture.recoveryRoot
	};
	return withEnvironment(scoped, () => {
		const keys = crypto.generateKeyPairSync("rsa", {
			modulusLength: 2048,
			publicKeyEncoding: { format: "pem", type: "spki" },
			privateKeyEncoding: { format: "pem", type: "pkcs8" }
		});
		const options = {
			installRoot: fixture.runtimeRoot,
			recoveryRoot: fixture.recoveryRoot
		};
		const deviceId = `dev_fixture_${crypto.randomBytes(10).toString("hex")}`;
		Identity.Metadata.write(options, {
			deviceId,
			tunnelId: "tun_transaction_fixture",
			publicKey: keys.publicKey,
			publicKeyFingerprint: Identity.KeyCoherence.fingerprint(keys.publicKey),
			pairedAt: new Date().toISOString(),
			credentialVersion: 3,
			createdAt: new Date().toISOString(),
			environment: "test",
			identityEnvironment: "test"
		});
		Identity.SecureStore.write(deviceId, "private-key", keys.privateKey);
		Identity.SecureStore.write(deviceId, "credential", "fixture-only-credential");
		const state = Identity.load(options);
		if (!state.ok) throw new Error(`fixture_identity_unpaired:${state.state}`);
		return deviceId;
	});
}

/** Prevent fixture environmental scopes from escaping into other tests. */
function withEnvironment(scoped, operation) {
	const previous = new Map(Object.keys(scoped).map(key => [key, process.env[key]]));
	try {
		Object.assign(process.env, scoped);
		return operation();
	} finally {
		for (const [key, value] of previous) {
			if (value === undefined) delete process.env[key];
			else process.env[key] = value;
		}
	}
}

module.exports = { environment, seed, withEnvironment };
