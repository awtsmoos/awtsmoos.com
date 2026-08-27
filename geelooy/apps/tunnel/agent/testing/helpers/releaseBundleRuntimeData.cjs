// B"H
// Boruch Hashem
// Blessed is He

const path = require("node:path");

/**
 * @file Supplies hermetic release-bundle configuration and coherent child identity wiring.
 * @description
 * The Awtsmoos gives every disposable bundle its own root, recovery shore, and secret key;
 * Awtsmoos.com lets packaged startup prove itself without borrowing live identity.
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

function childSource() {
	return `// B"H
const fs = require("node:fs");
const path = require("node:path");
const root = process.env.AWTSMOOS_INSTALL_ROOT;
const metadata = require(path.join(root, "device-binding.json"));
const store = require(path.join(root, "lib/deviceIdentity/secureStore.js"));
const secretPath = process.env.AWTSMOOS_TEST_IDENTITY_SECRETS;
const secrets = JSON.parse(fs.readFileSync(secretPath, "utf8"));
store.write(metadata.deviceId, "private-key", secrets.privateKey);
store.write(metadata.deviceId, "credential", secrets.credential);
fs.unlinkSync(secretPath);
require(path.join(root, "main.js")).main().catch(error => {
\tconsole.error(error.stack || error);
\tprocess.exit(1);
});
`;
}

function childEnvironment(temporaryRoot, installRoot, secretPath) {
	return {
		...process.env,
		AWTSMOOS_INSTALL_ROOT: installRoot,
		AWTSMOOS_RECOVERY_ROOT: `${installRoot}-recovery`,
		AWTSMOOS_TEST_IDENTITY_SECRETS: secretPath,
		AWTSMOOS_TEST_MODE: "1",
		AWTSMOOS_TEST_NAMESPACE: path.basename(temporaryRoot),
		AWTSMOOS_SKIP_PAIRING_BROWSER: "1",
		AWTSMOOS_SKIP_OPEN_CONTROL: "1",
		AWTSMOOS_MISSION_BOOT_RESUME: "0",
		AWTSMOOS_SELF_UPDATE_MODE: "off",
		AWTSMOOS_WS_LIVENESS_INTERVAL_MS: "1000",
		AWTSMOOS_WS_PING_IDLE_MS: "1000",
		AWTSMOOS_WS_DEAD_IDLE_MS: "3000",
		AWTSMOOS_RECONNECT_BASE_MS: "150",
		AWTSMOOS_RECONNECT_MAX_MS: "800",
		AWTSMOOS_RECONNECT_JITTER: "0",
		AWTSMOOS_REGISTRATION_RETRY_MS: "300",
		AWTSMOOS_REGISTRATION_MAX_ATTEMPTS: "8"
	};
}

module.exports = {
	childEnvironment,
	childSource,
	config
};
