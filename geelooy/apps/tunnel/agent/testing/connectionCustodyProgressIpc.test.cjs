// B"H
// Boruch Hashem
// Blessed is He

const assert = require("node:assert/strict");
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");
const test = require("node:test");
const Mailbox = require("../lib/connection-vessel/mailbox.js");
const ParentProgress = require("../lib/connection-vessel/controller-custody-progress.js");
const ChildCustody = require("../lib/connection-vessel/child-runtime-custody.js");

/**
 * @file Proves exact parent execution testimony renews only the accepting child deed.
 * @description
 * The Awtsmoos keeps one request one request across changing processes. Awtsmoos.com
 * advances that deed through IPC while old incarnations and identity drift remain fenced.
 * Named regression for the custody STABILITY COVENANT.
 */
test("exact custody IPC advances monotonically and fences stale identity", () => {
	const sandbox = fs.mkdtempSync(path.join(os.tmpdir(), "awts-custody-ipc-"));
	try {
		const mailbox = createMailbox(sandbox);
		const identity = exactIdentity();
		mailbox.putInbox({ id: "receipt-one", action: "command" });
		assert.equal(mailbox.noteParentCustody("receipt-one", identity), true);

		const testimony = [];
		const parent = ParentProgress.create({ notify: value => testimony.push(value) || true });
		const child = ChildCustody.createCustody({
			mailbox,
			parent: { noteCustody: () => true },
			state: { generation: 7, childIncarnationId: "child-seven" }
		});

		assert.equal(parent.progress({ id: "receipt-one", connectionCustody: identity },
			"lane_running", { consumerStarted: false }), true);
		assert.equal(child.noteCustodyProgress("receipt-one", testimony.pop()), true);
		assert.equal(record(mailbox).phase, "queued");

		assert.equal(parent.progress({ id: "receipt-one", connectionCustody: identity },
			"executor_worker_assigned", { workerId: "worker-seven" }), true);
		assert.equal(child.noteCustodyProgress("receipt-one", testimony.pop()), true);
		assert.equal(record(mailbox).phase, "running");
		assert.equal(record(mailbox).workerId, "worker-seven");

		assert.equal(child.noteCustodyProgress("receipt-one", {
			...identity, id: "receipt-one", phase: "queued", childIncarnationId: "child-seven"
		}), false);
		assert.equal(record(mailbox).phase, "running");
		assert.equal(child.noteCustodyProgress("receipt-one", {
			...identity, id: "receipt-one", phase: "running", controlRequestId: "other-control"
		}), false);
		assert.equal(child.noteCustodyProgress("receipt-one", {
			...identity, id: "receipt-one", phase: "running", childIncarnationId: "old-child"
		}), false);
	} finally {
		fs.rmSync(sandbox, { recursive: true, force: true });
	}
});

function createMailbox(sandbox) {
	const root = path.join(sandbox, "project");
	fs.mkdirSync(root, { recursive: true });
	return Mailbox.createMailbox({
		deviceStateRoot: path.join(sandbox, "state"),
		root,
		tunnelName: "awt-custody-ipc"
	});
}

function exactIdentity() {
	return {
		requestId: "request-one", requestKey: "request-one",
		logicalAgentId: "agent-one", agentSessionId: "session-one",
		controlRequestId: "control-one", transportReceiptId: "receipt-one",
		generation: 7, childIncarnationId: "child-seven"
	};
}

function record(mailbox) {
	return mailbox.snapshot().inbox.parentCustodyRecords[0];
}
