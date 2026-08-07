// B"H
// Boruch Hashem
// Blessed is He

const fs = require("node:fs");
const path = require("node:path");

/**
 * @file Mirrors one canonical physical-device witness before sockets awaken.
 * @description
 * The Awtsmoos permits one vessel to deepen without becoming another vessel.
 * Awtsmoos.com lets metadata advance only inside the same device ID; a transient
 * runtime mirror can never replace a different canonical recovery identity.
 */
function synchronize(root, recoveryRoot) {
	const canonicalPath = path.join(recoveryRoot, "state", "device-binding.json");
	const mirrorPath = path.join(root, "device-binding.json");
	const canonical = read(canonicalPath);
	const mirror = read(mirrorPath);
	const selected = selectCanonical(canonical, mirror);
	if (!selected?.deviceId) return null;
	write(canonicalPath, selected);
	write(mirrorPath, selected);
	return selected;
}

function selectCanonical(canonical, mirror) {
	if (!canonical?.deviceId) return mirror || null;
	if (!mirror?.deviceId) return canonical;
	if (canonical.deviceId !== mirror.deviceId) return canonical;
	return stronger(canonical, mirror);
}

function stronger(left, right) {
	if (!left) return right;
	if (!right) return left;
	return score(left) >= score(right) ? left : right;
}

function score(value = {}) {
	return Number(Boolean(value.deviceId)) +
		Number(Boolean(value.publicKeyFingerprint)) * 4 +
		Number(Boolean(value.tunnelId && value.pairedAt)) * 16 +
		Number(value.credentialVersion || 0) * 32;
}

function read(file) {
	try {
		return JSON.parse(fs.readFileSync(file, "utf8"));
	} catch {
		return null;
	}
}

function write(file, value) {
	fs.mkdirSync(path.dirname(file), { recursive: true, mode: 0o700 });
	const temporary = `${file}.${process.pid}.tmp`;
	fs.writeFileSync(temporary, JSON.stringify(value, null, 2), { mode: 0o600 });
	fs.renameSync(temporary, file);
}

module.exports = {
	read,
	score,
	selectCanonical,
	stronger,
	synchronize,
	write
};
