// B"H

const assert = require("node:assert/strict");
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");
const test = require("node:test");
const Health = require("../lib/connection-vessel/child-health.js");
const Mailbox = require("../lib/connection-vessel/mailbox.js");

test("parent-owned degraded inbox remains healthy without deleting testimony", () => {
	const root = fs.mkdtempSync(path.join(os.tmpdir(), "mailbox-custody-"));
	const mailbox = Mailbox.createMailbox({ deviceStateRoot: root }, {
		now: () => Date.now() - 90000
	});
	mailbox.putInbox({ id: "one", type: "TUNNEL_REQUEST" });
	mailbox.putInbox({ id: "two", type: "TUNNEL_REQUEST" });
	mailbox.noteParentCustody("one");
	mailbox.noteParentCustody("two");
	const snapshot = mailbox.snapshot();
	const result = compose(snapshot);
	assert.equal(snapshot.inbox.count, 2);
	assert.equal(snapshot.inbox.parentCustodyCount, 2);
	assert.equal(result.healthy, true);
	assert.equal(result.mailbox.activeExecutionGrace, true);
	assert.equal(mailbox.inbox().length, 2);
});

test("partial custody remains degraded and exact settlement removes its count", () => {
	const root = fs.mkdtempSync(path.join(os.tmpdir(), "mailbox-custody-"));
	const mailbox = Mailbox.createMailbox({ deviceStateRoot: root });
	mailbox.putInbox({ id: "one", type: "TUNNEL_REQUEST" });
	mailbox.putInbox({ id: "two", type: "TUNNEL_REQUEST" });
	mailbox.noteParentCustody("one");
	const forced = forceDegraded(mailbox.snapshot());
	assert.equal(compose(forced).healthy, false);
	mailbox.acknowledge("one");
	assert.equal(mailbox.snapshot().inbox.parentCustodyCount, 0);
	assert.equal(mailbox.inbox().length, 1);
});

function compose(mailbox) {
	return Health.compose({
		activeWs: { opened: true },
		registrationConfirmed: true
	}, {
		healthy: true,
		execution: { healthy: true, stages: {} }
	}, forceDegraded(mailbox));
}

function forceDegraded(mailbox) {
	return {
		...mailbox,
		health: { healthy: false, state: "degraded" },
		inbox: { ...mailbox.inbox, state: "degraded" },
		outbox: { ...mailbox.outbox, state: "healthy" }
	};
}
