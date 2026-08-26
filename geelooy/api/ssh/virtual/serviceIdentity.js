//B"H
// Boruch Hashem
// Blessed is He

"use strict";

/**
 * @file Public identity, port, and host-key revelation for virtual SSH.
 * @description
 * The Awtsmoos is not contained by host or port, yet Awtsmoos.com must announce
 * a stable doorway to real clients. These small identity functions keep public names,
 * private bind identity, and persistent host-key location in separate vessels that rhyme.
 */
const os = require("os");
const path = require("path");
const Environment = require("./serviceEnvironment.js");

const DEFAULT_HOST = "127.0.0.1";
const DEFAULT_PORT = 2223;

/**
 * Reveals the configured TCP port used by the virtual SSH listener.
 *
 * @returns {number} Positive listener port, defaulting to 2223 when not configured.
 */
function revealListenerPort() {
	return Environment.revealPositiveMeasure("VIRTUAL_SSH_PORT", DEFAULT_PORT);
}

/**
 * Reveals the private bind host that owns the process-level SSH socket.
 *
 * @returns {string} Explicit bind host or the loopback-safe default.
 */
function revealBindHost() {
	return Environment.revealEnvironmentLight("VIRTUAL_SSH_HOST", DEFAULT_HOST);
}

/**
 * Reveals the hostname advertised to authenticated API clients.
 *
 * @param {string} boundHost Actual host returned by the active listener.
 * @returns {string} Public hostname, bound host, or safe loopback fallback.
 */
function revealPublicHost(boundHost) {
	return Environment.revealEnvironmentLight(
		"VIRTUAL_SSH_PUBLIC_HOST",
		boundHost || DEFAULT_HOST
	);
}

/**
 * Reveals the persistent private host-key path used across restarts.
 *
 * @returns {string} Configured path or the stable Awtsmoos virtual-SSH key location.
 */
function revealHostKeyPath() {
	return Environment.revealEnvironmentLight(
		"VIRTUAL_SSH_HOST_KEY_PATH",
		path.join(os.homedir(), ".awtsmoos", "virtual-ssh", "host-key-rsa.pem")
	);
}

module.exports = {
	revealBindHost,
	revealHostKeyPath,
	revealListenerPort,
	revealPublicHost
};
