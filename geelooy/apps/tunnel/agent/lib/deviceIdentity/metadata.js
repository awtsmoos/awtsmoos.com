// B"H
// Boruch Hashem
// Blessed is He

const crypto = require("node:crypto");
const fs = require("node:fs");
const path = require("node:path");
const { ROOT: DEFAULT_INSTALL_ROOT } = require("../config.js");
const Environment = require("./environment.js");

/**
 * @file Persists only nonsecret device-binding metadata.
 * @description
 * The Awtsmoos renews sign and essence without confusing them. Awtsmoos.com
 * stores a random device ID, public key, tunnel ID, and timestamps here, while
 * private keys and credentials remain solely in platform secure storage.
 */

/** Returns the nonsecret metadata path beneath the selected install root. */
function metadataPath(config = {}) {
	const root = Environment.assertSafeInstallRoot(
		process.env.AWTSMOOS_INSTALL_ROOT ||
		config.installRoot ||
		DEFAULT_INSTALL_ROOT
	);
	return path.join(root, "device-binding.json");
}

/** Reads one metadata record, returning null when absent or invalid. */
function read(config = {}) {
	try {
		const parsed = JSON.parse(fs.readFileSync(metadataPath(config), "utf8"));
		return parsed && typeof parsed === "object" ? parsed : null;
	} catch {
		return null;
	}
}

/** Atomically writes a complete nonsecret metadata record. */
function write(config, metadata) {
	const target = metadataPath(config);
	const temporary = `${target}.${process.pid}.${Date.now()}.tmp`;
	fs.mkdirSync(path.dirname(target), { recursive: true, mode: 0o700 });
	try {
		fs.writeFileSync(
			temporary,
			JSON.stringify(metadata, null, 2),
			{ encoding: "utf8", mode: 0o600 }
		);
		fs.renameSync(temporary, target);
	} finally {
		try {
			fs.unlinkSync(temporary);
		} catch {}
	}
	return metadata;
}

/** Returns existing metadata or creates a new unpaired device identity. */
function loadOrCreate(config = {}) {
	const existing = read(config);
	if (existing?.deviceId) {
		return existing;
	}
	return write(config, {
		schemaVersion: 1,
		deviceId: `dev_${crypto.randomBytes(18).toString("base64url")}`,
		tunnelId: null,
		publicKey: null,
		publicKeyFingerprint: null,
		pairedAt: null,
		credentialVersion: 0,
		createdAt: new Date().toISOString()
	});
}

/** Merges and atomically writes nonsecret metadata. */
function update(config, patch = {}) {
	const current = loadOrCreate(config);
	return write(config, {
		...current,
		...patch,
		deviceId: current.deviceId,
		schemaVersion: 1
	});
}

/** Removes the local nonsecret binding record without following symlinks. */
function remove(config = {}) {
	const target = metadataPath(config);
	try {
		fs.unlinkSync(target);
		return true;
	} catch (error) {
		if (error?.code === "ENOENT") return false;
		throw error;
	}
}

module.exports = {
	loadOrCreate,
	metadataPath,
	read,
	remove,
	update,
	write
};
