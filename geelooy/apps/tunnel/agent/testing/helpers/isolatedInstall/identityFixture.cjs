// B"H

const Metadata = require("../../../lib/deviceIdentity/metadata.js");
const SecureStore = require("../../../lib/deviceIdentity/secureStore.js");

/** Provisions a namespaced disposable credential in platform secure storage. */
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
		const metadata = Metadata.write({ installRoot }, {
			schemaVersion: 1,
			deviceId: `dev_${namespace}`,
			tunnelId: `tun_${namespace}`,
			publicKey: "isolated-test-public-key",
			publicKeyFingerprint: "isolated-test-fingerprint",
			pairedAt: new Date().toISOString(),
			credentialVersion: 1,
			createdAt: new Date().toISOString()
		});
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

function withEnvironment(values, action) {
	const previous = Object.fromEntries(
		Object.keys(values).map((key) => [key, process.env[key]])
	);
	Object.assign(process.env, values);
	try { return action(); }
	finally {
		for (const [key, value] of Object.entries(previous)) {
			if (value === undefined) delete process.env[key];
			else process.env[key] = value;
		}
	}
}

module.exports = { provision, withEnvironment };
