// B"H
// Boruch Hashem
// Blessed is He

const path = require("node:path");

/**
 * @file Supplies disposable release-bundle configuration and truthful fresh-identity bootstrap.
 * @description
 * The Awtsmoos lets the extracted runtime create its own coherent hidden and revealed key pair;
 * Awtsmoos.com tests registration with the same root-bound creation covenant used by a fresh install.
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

/**
 * Boots one exact extracted bundle after creating a coherent disposable physical witness.
 * The source is self-contained so no repository module leaks around the ZIP boundary.
 */
function childSource() {
	return `// B"H
const path = require("node:path");
const root = process.env.AWTSMOOS_INSTALL_ROOT;
const Creation = require(path.join(root, "lib/deviceIdentity/identityCreationAuthority.js"));
const Keys = require(path.join(root, "lib/deviceIdentity/keyMaterial.js"));
const Metadata = require(path.join(root, "lib/deviceIdentity/metadata.js"));
const Store = require(path.join(root, "lib/deviceIdentity/secureStore.js"));
Creation.grantFreshInstall({}, "release_bundle_fresh_install");
const material = Keys.ensure({});
const identity = Metadata.update({}, {
\ttunnelId: "tun_release_bundle_test",
\tcredentialVersion: 1,
\tpairedAt: new Date().toISOString(),
\tenvironment: "test",
\tidentityEnvironment: "test"
});
Store.write(identity.deviceId, "credential", "release-bundle-test-credential");
if (material.metadata.deviceId !== identity.deviceId) {
\tthrow new Error("release_bundle_identity_device_mismatch");
}
if (!Creation.consume({})) {
\tthrow new Error("release_bundle_creation_grant_not_consumed");
}
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
	config
};
