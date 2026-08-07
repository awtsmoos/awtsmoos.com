// B"H
// Boruch Hashem
// Blessed is He

const assert = require("node:assert/strict");
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");
const { spawnSync } = require("node:child_process");

/**
 * @file Proves installer selection cannot resurrect a foreign historical device.
 * @description
 * The Awtsmoos keeps one canonical witness above stale credentials and rollback
 * shadows. Awtsmoos.com accepts no substitute device unless canonical recovery is
 * absent and the substitute can prove possession with its matching private key.
 */
(() => {
	const base = fs.mkdtempSync(path.join(os.tmpdir(), "awtsmoos-installer-identity-"));
	const root = path.join(base, ".awtsmoos-tunnel");
	const recovery = path.join(base, ".awtsmoos-tunnel-recovery");
	const rollback = path.join(base, ".awtsmoos-tunnel.rollback");
	const canonical = path.join(recovery, "state", "device-binding.json");
	const stale = path.join(rollback, "device-binding.json");
	fs.mkdirSync(path.dirname(canonical), { recursive: true });
	fs.mkdirSync(rollback, { recursive: true });
	fs.writeFileSync(canonical, JSON.stringify(identity("dev_canonical", 1)));
	fs.writeFileSync(stale, JSON.stringify(identity("dev_stale", 999)));
	const script = path.resolve(__dirname, "../unix-device-identity-state.sh");
	assert.equal(select(root, recovery, script), canonical);
	fs.rmSync(canonical, { force: true });
	assert.equal(select(root, recovery, script), "");
	fs.rmSync(base, { recursive: true, force: true });
	console.log(JSON.stringify({ ok: true, suite: "unix-device-identity-authority" }));
})();

function select(root, recovery, script) {
	const command = 'ROOT="$1"; RECOVERY_ROOT="$2"; source "$3"; select_authoritative_identity';
	const run = spawnSync("/bin/bash", ["-c", command, "fixture", root, recovery, script], {
		encoding: "utf8",
		timeout: 15000
	});
	assert.equal(run.status, 0, run.stderr);
	return String(run.stdout || "").trim();
}

function identity(deviceId, credentialVersion) {
	return {
		deviceId,
		tunnelId: `tun_${deviceId}`,
		pairedAt: new Date().toISOString(),
		publicKeyFingerprint: `missing-key-${deviceId}`,
		credentialVersion
	};
}
