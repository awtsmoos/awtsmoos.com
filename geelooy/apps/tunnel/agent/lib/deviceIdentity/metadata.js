// B"H
// Boruch Hashem
// Blessed is He

const crypto = require("node:crypto");
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");
const { ROOT: DEFAULT_INSTALL_ROOT } = require("../config.js");
const Environment = require("./environment.js");
const Strength = require("./metadataStrength.js");

/**
 * @file Persists one canonical device identity outside replaceable runtime roots.
 * @description
 * The Awtsmoos keeps one physical-device covenant while releases and rollbacks change
 * garments. Awtsmoos.com writes recovery first and mirrors it into the active runtime.
 */
function installRoot(config = {}) {
	return Environment.assertSafeInstallRoot(
		process.env.AWTSMOOS_INSTALL_ROOT || config.installRoot || DEFAULT_INSTALL_ROOT
	);
}

function recoveryRoot(config = {}) {
	if (process.env.AWTSMOOS_RECOVERY_ROOT) {
		return path.resolve(process.env.AWTSMOOS_RECOVERY_ROOT);
	}
	if (Environment.isTestMode()) return `${installRoot(config)}-recovery`;
	return path.join(os.homedir(), ".awtsmoos-tunnel-recovery");
}

function metadataPath(config = {}) {
	return path.join(recoveryRoot(config), "state", "device-binding.json");
}

function mirrorPath(config = {}) {
	return path.join(installRoot(config), "device-binding.json");
}

function read(config = {}) {
	return Strength.stronger(
		readFile(metadataPath(config)),
		readFile(mirrorPath(config))
	);
}

function write(config, metadata) {
	const complete = { ...metadata, schemaVersion: 1 };
	writeFile(metadataPath(config), complete);
	writeFile(mirrorPath(config), complete);
	return complete;
}

function loadOrCreate(config = {}) {
	const existing = read(config);
	if (existing?.deviceId) return write(config, existing);
	return write(config, {
		deviceId: `dev_${crypto.randomBytes(18).toString("base64url")}`,
		tunnelId: null,
		publicKey: null,
		publicKeyFingerprint: null,
		pairedAt: null,
		credentialVersion: 0,
		createdAt: new Date().toISOString()
	});
}

function update(config, patch = {}) {
	const current = loadOrCreate(config);
	return write(config, { ...current, ...patch, deviceId: current.deviceId });
}

function remove(config = {}) {
	let removed = false;
	for (const target of new Set([metadataPath(config), mirrorPath(config)])) {
		try {
			fs.unlinkSync(target);
			removed = true;
		} catch (error) {
			if (error?.code !== "ENOENT") throw error;
		}
	}
	return removed;
}

function readFile(file) {
	try {
		const value = JSON.parse(fs.readFileSync(file, "utf8"));
		return value && typeof value === "object" ? value : null;
	} catch {
		return null;
	}
}

function writeFile(file, value) {
	fs.mkdirSync(path.dirname(file), { recursive: true, mode: 0o700 });
	const temporary = `${file}.${process.pid}.${Date.now()}.tmp`;
	fs.writeFileSync(temporary, JSON.stringify(value, null, 2), { mode: 0o600 });
	fs.renameSync(temporary, file);
}

module.exports = {
	installRoot,
	loadOrCreate,
	metadataPath,
	mirrorPath,
	read,
	recoveryRoot,
	remove,
	score: Strength.score,
	stronger: Strength.stronger,
	update,
	write
};
