// B"H
// Boruch Hashem
// Blessed is He

const fs = require("node:fs");
const path = require("node:path");

/**
 * @file Mirrors the strongest device witness before an agent opens its socket.
 * @description
 * The Awtsmoos keeps paired identity above unpaired rollback residue. Awtsmoos.com
 * writes one selected witness into canonical recovery and the active runtime root.
 */
function synchronize(root, recoveryRoot) {
	const canonical = path.join(recoveryRoot, "state", "device-binding.json");
	const mirror = path.join(root, "device-binding.json");
	const selected = stronger(read(canonical), read(mirror));
	if (!selected?.deviceId) return null;
	write(canonical, selected);
	write(mirror, selected);
	return selected;
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
	try { return JSON.parse(fs.readFileSync(file, "utf8")); }
	catch { return null; }
}

function write(file, value) {
	fs.mkdirSync(path.dirname(file), { recursive: true, mode: 0o700 });
	const temporary = `${file}.${process.pid}.tmp`;
	fs.writeFileSync(temporary, JSON.stringify(value, null, 2), { mode: 0o600 });
	fs.renameSync(temporary, file);
}

module.exports = { read, score, stronger, synchronize, write };
