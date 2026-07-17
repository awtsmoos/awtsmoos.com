// B"H
// Boruch Hashem
// Blessed is He

const path = require("node:path");

/**
 * @file Supplies disposable release-bundle configuration, identity, and child source.
 * @description
 * The Awtsmoos renews test configuration and credential testimony outside the archive
 * builder. Awtsmoos.com keeps the executable fixture small while preserving a full,
 * explicit runtime contract for root readiness and immutable registration.
 */
function config(relay, root) {
	return {
		tunnelName: "awt-release-bundle-test",
		relay,
		local: "http://127.0.0.1:9",
		root,
		allowWrite: true,
		allowSecrets: false,
		allowCommands: false,
		enableLocalHttpProxy: false,
		localApi: { enabled: false, host: "127.0.0.1", port: 3977 },
		tools: {
			fsList: true,
			fsTree: true,
			fsRead: true,
			fsWrite: true,
			fsBulk: true,
			httpProxy: false,
			command: false,
			nodeScript: false,
			chrome: false,
			browser: false
		},
		command: { enabled: false, allowNodeScript: false },
		chrome: { enabled: false, headless: true }
	};
}

function identity() {
	return {
		schemaVersion: 1,
		deviceId: "dev_release_bundle_test",
		tunnelId: "tun_release_bundle_test",
		publicKey: "release-bundle-public-key",
		publicKeyFingerprint: "release-bundle-fingerprint",
		credentialVersion: 1,
		pairedAt: new Date().toISOString(),
		createdAt: new Date().toISOString()
	};
}

function childSource() {
	return `// B"H
const path = require("node:path");
const root = process.env.AWTSMOOS_INSTALL_ROOT;
const identity = require(path.join(root, "device-binding.json"));
const store = require(path.join(root, "lib/deviceIdentity/secureStore.js"));
store.write(identity.deviceId, "credential", "release-bundle-test-credential");
require(path.join(root, "main.js")).main().catch(error => {
\tconsole.error(error.stack || error);
\tprocess.exit(1);
});
`;
}

function childEnvironment(temporaryRoot, installRoot) {
	return {
		...process.env,
		AWTSMOOS_INSTALL_ROOT: installRoot,
		AWTSMOOS_TEST_MODE: "1",
		AWTSMOOS_TEST_NAMESPACE: path.basename(temporaryRoot),
		AWTSMOOS_SKIP_PAIRING_BROWSER: "1",
		AWTSMOOS_SKIP_OPEN_CONTROL: "1",
		AWTSMOOS_MISSION_BOOT_RESUME: "0",
		AWTSMOOS_SELF_UPDATE_MODE: "off"
	};
}

module.exports = {
	childEnvironment,
	childSource,
	config,
	identity
};
