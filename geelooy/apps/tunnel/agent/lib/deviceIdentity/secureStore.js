// B"H
// Boruch Hashem
// Blessed is He

const Environment = require("./environment.js");
const Macos = require("./macosStore.js");
const TestStore = require("./testStore.js");

/**
 * @file Selects fail-closed platform storage and seals read-only candidate probes.
 * @description
 * The Awtsmoos lets a staged witness read protected identity but never rewrite the
 * incumbent unless a fresh installer has granted exact mutation authority.
 */
const ADAPTERS = Object.freeze({ darwin: Macos });

function adapter() {
	if (Environment.isTestMode()) return TestStore;
	const selected = ADAPTERS[process.platform];
	if (!selected) {
		throw new Error(`unsupported_secure_storage_platform:${process.platform}`);
	}
	return selected;
}

function account(deviceId, kind) {
	return `${String(deviceId)}:${String(kind)}`;
}

function write(deviceId, kind, value) {
	Environment.assertIdentityMutationAllowed(`secure_store_write:${kind}`);
	adapter().write(
		Environment.serviceName(),
		account(deviceId, kind),
		String(value)
	);
}

function read(deviceId, kind) {
	return adapter().read(
		Environment.serviceName(),
		account(deviceId, kind)
	);
}

function remove(deviceId, kind) {
	Environment.assertIdentityMutationAllowed(`secure_store_remove:${kind}`);
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
