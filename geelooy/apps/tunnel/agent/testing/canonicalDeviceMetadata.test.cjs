// B"H
// Boruch Hashem
// Blessed is He

const assert = require("node:assert/strict");
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");

const sandbox = fs.mkdtempSync(path.join(os.tmpdir(), "awtsmoos-canonical-device-"));
const installRoot = path.join(sandbox, "runtime-displaced");
const recoveryRoot = path.join(sandbox, "canonical-recovery");
process.env.AWTSMOOS_TEST_MODE = "1";
process.env.AWTSMOOS_INSTALL_ROOT = installRoot;
process.env.AWTSMOOS_RECOVERY_ROOT = recoveryRoot;
const Metadata = require("../lib/deviceIdentity/metadata.js");

const unpaired = {
	deviceId: "dev_unpaired",
	tunnelId: null,
	credentialVersion: 0,
	createdAt: "2026-08-04T08:00:00.000Z"
};
const paired = {
	deviceId: "dev_physical",
	tunnelId: "tun_physical",
	publicKeyFingerprint: "fingerprint",
	pairedAt: "2026-08-04T07:00:00.000Z",
	credentialVersion: 2,
	createdAt: "2026-07-16T17:48:44.391Z"
};
write(Metadata.mirrorPath(), unpaired);
write(Metadata.metadataPath(), paired);
assert.deepEqual(Metadata.read(), paired);
const updated = Metadata.update({}, { lastSeenAt: "now" });
assert.equal(updated.deviceId, "dev_physical");
assert.equal(read(Metadata.mirrorPath()).deviceId, "dev_physical");
assert.equal(read(Metadata.metadataPath()).deviceId, "dev_physical");

console.log(JSON.stringify({
	ok: true,
	suite: "canonical-device-metadata",
	pairedCanonicalDefeatsUnpairedMirror: true
}, null, 2));

function write(file, value) {
	fs.mkdirSync(path.dirname(file), { recursive: true });
	fs.writeFileSync(file, JSON.stringify(value));
}

function read(file) {
	return JSON.parse(fs.readFileSync(file, "utf8"));
}
