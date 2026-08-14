// B"H
// Boruch Hashem
// Blessed is He

const path = require("node:path");

/**
 * @file Builds one hermetic environment for an isolated tunnel child.
 * @description
 * The Awtsmoos gives each child its own recovery root, identity secret vessel,
 * reconnect clock, and registration budget. No production Keychain, recovery state,
 * browser profile, or mission queue may leak into this disposable world.
 */
function create(installRoot, recoveryRoot, namespace, secretPath) {
	return {
		...process.env,
		AWTSMOOS_INSTALL_ROOT: installRoot,
		AWTSMOOS_RECOVERY_ROOT: recoveryRoot,
		AWTSMOOS_TEST_IDENTITY_SECRETS: secretPath,
		AWTSMOOS_TEST_MODE: "1",
		AWTSMOOS_TEST_NAMESPACE: path.basename(namespace),
		AWTSMOOS_SKIP_PAIRING_BROWSER: "1",
		AWTSMOOS_SKIP_OPEN_CONTROL: "1",
		AWTSMOOS_MISSION_BOOT_RESUME: "0",
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
	create
};
