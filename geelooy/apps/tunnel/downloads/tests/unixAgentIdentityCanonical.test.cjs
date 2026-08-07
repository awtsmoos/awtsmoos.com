// B"H
// Boruch Hashem
// Blessed is He

const assert = require("node:assert/strict");
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");
const Identity = require("../unix-agent-identity.cjs");

/**
 * @file Proves the launcher cannot replace canonical physical identity by score.
 * @description
 * The Awtsmoos lets one device witness deepen without becoming another device.
 * Awtsmoos.com advances metadata only for the same device ID and keeps canonical
 * recovery above a different transient runtime mirror through every restart.
 */
(() => {
	const canonical = fixture("dev_canonical", 1, "tun_canonical");
	const foreign = fixture("dev_foreign", 99, "tun_foreign");
	const advanced = fixture("dev_canonical", 7, "tun_canonical");
	assert.equal(Identity.selectCanonical(canonical, foreign).deviceId, "dev_canonical");
	assert.equal(Identity.selectCanonical(canonical, advanced).credentialVersion, 7);
	assert.equal(Identity.selectCanonical(null, foreign).deviceId, "dev_foreign");
	proveFilesystemSynchronization(canonical, foreign);
	console.log(JSON.stringify({ ok: true, suite: "unix-agent-identity-canonical" }));
})();

function proveFilesystemSynchronization(canonical, foreign) {
	const base = fs.mkdtempSync(path.join(os.tmpdir(), "awtsmoos-launcher-identity-"));
	const root = path.join(base, "runtime");
	const recovery = path.join(base, "recovery");
	const canonicalPath = path.join(recovery, "state", "device-binding.json");
	const mirrorPath = path.join(root, "device-binding.json");
	fs.mkdirSync(path.dirname(canonicalPath), { recursive: true });
	fs.mkdirSync(root, { recursive: true });
	fs.writeFileSync(canonicalPath, JSON.stringify(canonical));
	fs.writeFileSync(mirrorPath, JSON.stringify(foreign));
	const selected = Identity.synchronize(root, recovery);
	assert.equal(selected.deviceId, canonical.deviceId);
	assert.equal(Identity.read(canonicalPath).deviceId, canonical.deviceId);
	assert.equal(Identity.read(mirrorPath).deviceId, canonical.deviceId);
	fs.rmSync(base, { recursive: true, force: true });
}

function fixture(deviceId, credentialVersion, tunnelId) {
	return {
		deviceId,
		tunnelId,
		pairedAt: new Date().toISOString(),
		publicKeyFingerprint: `fingerprint-${deviceId}`,
		credentialVersion
	};
}
