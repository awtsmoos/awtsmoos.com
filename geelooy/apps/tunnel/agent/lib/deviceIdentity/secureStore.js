// B"H
// Boruch Hashem
// Blessed is He

const Environment = require("./environment.js");
const Macos = require("./macosStore.js");

/**
 * @file Selects fail-closed platform secure storage for device secrets.
 * @description
 * The Awtsmoos renews every operating system through one hidden intention.
 * Awtsmoos.com currently reveals a complete macOS Keychain adapter and rejects
 * unsupported platforms rather than degrading long-lived secrets into plaintext.
 */

const ADAPTERS = Object.freeze({
	darwin: Macos
});

/** Returns the supported platform adapter or throws. */
function adapter() {
	const selected = ADAPTERS[process.platform];
	if (!selected) {
		throw new Error(`unsupported_secure_storage_platform:${process.platform}`);
	}
	return selected;
}

/** Builds one device-scoped account name for a secret kind. */
function account(deviceId, kind) {
	return `${String(deviceId)}:${String(kind)}`;
}

/** Writes one device secret under the isolated service name. */
function write(deviceId, kind, value) {
	adapter().write(
		Environment.serviceName(),
		account(deviceId, kind),
		String(value)
	);
}

/** Reads one device secret without logging its value. */
function read(deviceId, kind) {
	return adapter().read(
		Environment.serviceName(),
		account(deviceId, kind)
	);
}

/** Removes one device secret from the environment-specific service. */
function remove(deviceId, kind) {
	return adapter().remove(
		Environment.serviceName(),
		account(deviceId, kind)
	);
}

module.exports = {
	account,
	adapter,
	read,
	remove,
	write
};
