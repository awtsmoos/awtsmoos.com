// B"H

const assert = require("node:assert/strict");
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");
const DeviceState = require("../tools/fs/deviceStateRoot.js");
const Mailbox = require("../lib/connection-vessel/mailbox.js");
const MailboxPaths = require("../lib/connection-vessel/mailbox-paths.js");

const temporary = fs.mkdtempSync(path.join(os.tmpdir(), "awts-state-root-"));
const configured = path.join(temporary, "canonical");
const config = {
	deviceStateRoot: configured,
	root: "/tmp/project",
	tunnelName: "awt-canonical-state"
};
assert.equal(DeviceState.root(config), configured);
assert.equal(
	DeviceState.awtsmoosRoot(config),
	path.join(configured, ".Awtsmoos")
);
assert.equal(DeviceState.root({ ...config, deviceStateRoot: "" }).includes(
	"awt-canonical-state"
), true);
const legacyOutbox = path.join(
	configured,
	DeviceState.deviceKey(config),
	".Awtsmoos",
	"connection-mailbox",
	"outbox"
);
const legacyEnvelope = {
	type: "TUNNEL_RESPONSE",
	id: "legacy-response",
	controlRequestId: "legacy-response",
	ok: true
};
const legacyFile = path.join(
	legacyOutbox,
	`${MailboxPaths.digest(legacyEnvelope.id)}.json`
);
fs.mkdirSync(legacyOutbox, { recursive: true });
fs.writeFileSync(legacyFile, JSON.stringify({
	id: legacyEnvelope.id,
	updatedAt: new Date().toISOString(),
	value: legacyEnvelope
}));

try {
	const mailbox = Mailbox.createMailbox(config);
	assert.deepEqual(mailbox.outbox(), [legacyEnvelope]);
	assert.equal(fs.existsSync(legacyFile), false);
	assert.equal(
		fs.existsSync(MailboxPaths.file(config, "outbox", legacyEnvelope.id)),
		true
	);
	console.log(JSON.stringify({
		ok: true,
		suite: "device-state-root-canonical",
		noDoubleDeviceKey: true,
		legacyMailboxMigrated: true
	}));
} finally {
	fs.rmSync(temporary, { recursive: true, force: true });
}
