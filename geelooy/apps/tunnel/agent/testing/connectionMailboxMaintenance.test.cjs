// B"H
// Boruch Hashem
// Blessed is He

const assert = require("node:assert/strict");
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");
const Health = require("../lib/connection-vessel/mailbox-health.js");
const Mailbox = require("../lib/connection-vessel/mailbox.js");
const Paths = require("../lib/connection-vessel/mailbox-paths.js");

/**
 * @file Proves capacity, settlement age, evidence, quarantine, and exact ACK.
 * @description
 * The Awtsmoos reveals pressure and delay without silently deleting accepted work.
 * Awtsmoos.com calls an ancient receipt stalled, preserves its testimony, and lets
 * a verified exact acknowledgment remove only the finite deed that truly settled.
 */
const sandbox = fs.mkdtempSync(path.join(os.tmpdir(), "awts-mailbox-maintenance-"));
const config = {
	deviceStateRoot: path.join(sandbox, "state"),
	root: path.join(sandbox, "project"),
	tunnelName: "awt-mailbox-maintenance"
};

try {
	fs.mkdirSync(config.root, { recursive: true });
	const mailbox = Mailbox.createMailbox(config, { maxCount: 5, maxBytes: 8192 });
	for (let index = 0; index < 4; index += 1) {
		mailbox.putInbox({ id: `request-${index}`, secret: `secret-${index}` });
	}
	assert.equal(mailbox.snapshot().inbox.state, "degraded");
	mailbox.putInbox({ id: "request-full", secret: "secret-full" });
	assert.equal(mailbox.snapshot().health.state, "full");
	assert.throws(
		() => mailbox.putInbox({ id: "request-overflow" }),
		error => error.code === "CONNECTION_MAILBOX_FULL" &&
			error.healthImpact === "transport_backpressure"
	);

	const now = Date.parse("2026-08-03T08:00:00.000Z");
	const stalled = Health.lane([
		{
			bytes: 32,
			updatedAt: new Date(now - Health.DEFAULT_STALLED_AGE_MS - 1).toISOString()
		}
	], {
		maxBytes: 8192,
		maxCount: 5
	}, "inbox", now);
	assert.equal(stalled.state, "stalled");
	assert.equal(stalled.healthy, false);
	assert.equal(
		stalled.nextActions.some(action => action.includes("inspect_stalled_inbox")),
		true
	);

	const redacted = mailbox.evidence(false);
	assert.equal(redacted.inbox[0].value, undefined);
	assert.ok(mailbox.evidence(true).inbox[0].value.secret);
	assert.deepEqual(mailbox.acknowledge("request-full"), {
		inbox: true,
		outbox: false
	});

	const corrupt = path.join(Paths.lane(config, "outbox"), "corrupt.json");
	fs.mkdirSync(path.dirname(corrupt), { recursive: true });
	fs.writeFileSync(corrupt, "not-json");
	const quarantined = mailbox.quarantineInvalid();
	assert.equal(quarantined.outbox.length, 1);
	assert.equal(fs.existsSync(corrupt), false);

	console.log(JSON.stringify({
		ok: true,
		suite: "connection-mailbox-maintenance",
		degradedAtEightyPercent: true,
		stalledAgeVisible: true,
		fullBackpressureExplicit: true,
		evidenceRedactedByDefault: true,
		exactAcknowledge: true,
		corruptQuarantine: true
	}, null, 2));
} finally {
	fs.rmSync(sandbox, { recursive: true, force: true });
}
