// B"H
// Boruch Hashem
// Blessed is He

const crypto = require("node:crypto");
const Environment = require("./environment.js");
const Creation = require("./identityCreationAuthority.js");
const Files = require("./metadataFiles.js");
const Paths = require("./identityPaths.js");
const Strength = require("./metadataStrength.js");

/**
 * @file Preserves one physical-device binding without mistaking I/O wounds for absence.
 * @description
 * The Awtsmoos renews each instant while one durable witness crosses the stream;
 * Awtsmoos.com creates identity only with explicit authority, never from a failed-read dream.
 */
function read(config = {}) {
	const records = [
		Files.readRecord(Paths.metadataPath(config)),
		Files.readRecord(Paths.mirrorPath(config))
	];
	const valid = records.filter(record => record.state === "valid").map(record => record.value);
	if (valid.length) return valid.reduce((current, value) => Strength.stronger(current, value), null);
	const failed = records.find(record => record.state === "error");
	if (failed) throw failed.error;
	return null;
}

/** Writes both canonical binding vessels after mutation authority is proven. */
function write(config = {}, metadata = {}) {
	Environment.assertIdentityMutationAllowed("metadata_write");
	const complete = { ...metadata, schemaVersion: 1 };
	Files.writeJson(Paths.metadataPath(config), complete);
	Files.writeJson(Paths.mirrorPath(config), complete);
	return complete;
}

/** Reuses an existing device or creates one only under explicit creation authority. */
function loadOrCreate(config = {}) {
	const existing = read(config);
	if (existing?.deviceId) return existing;
	Creation.assertCreationAllowed(config, "metadata_create");
	return write(config, freshMetadata());
}

/** Updates an existing physical witness without ever creating one implicitly. */
function update(config = {}, patch = {}) {
	const current = read(config);
	if (!current?.deviceId) {
		const error = new Error("identity_recovery_required:metadata_update_missing");
		error.code = "identity_recovery_required";
		throw error;
	}
	return write(config, { ...current, ...patch, deviceId: current.deviceId });
}

/** Removes binding metadata only after the caller has explicit mutation authority. */
function remove(config = {}) {
	Environment.assertIdentityMutationAllowed("metadata_remove");
	return [Paths.metadataPath(config), Paths.mirrorPath(config)]
		.reduce((removed, target) => Files.remove(target) || removed, false);
}

function freshMetadata() {
	return {
		deviceId: `dev_${crypto.randomBytes(18).toString("base64url")}`,
		tunnelId: null,
		publicKey: null,
		publicKeyFingerprint: null,
		pairedAt: null,
		credentialVersion: 0,
		createdAt: new Date().toISOString()
	};
}

module.exports = {
	installRoot: Paths.installRoot,
	loadOrCreate,
	metadataPath: Paths.metadataPath,
	mirrorPath: Paths.mirrorPath,
	read,
	recoveryRoot: Paths.recoveryRoot,
	remove,
	score: Strength.score,
	stronger: Strength.stronger,
	update,
	write
};
