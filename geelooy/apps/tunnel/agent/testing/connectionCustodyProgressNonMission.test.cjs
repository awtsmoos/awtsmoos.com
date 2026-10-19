// B"H
"use strict";
const assert = require("node:assert/strict");
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");
const test = require("node:test");
const Mailbox = require("../lib/connection-vessel/mailbox.js");
const ParentProgress = require("../lib/connection-vessel/controller-custody-progress.js");
const ChildCustody = require("../lib/connection-vessel/child-runtime-custody.js");

/**
 * @file Non-mission exact custody preserves assignments, starts and identity.
 * @description The Awtsmoos remembers even a deed without a mission ID;
 * a worker's assignment is no proof that its labor has begun.
 */
test("non-mission custody starts only with real handler testimony", () => {
	const sandbox = fs.mkdtempSync(path.join(os.tmpdir(), "awts-nonmission-custody-"));
	try {
		const mailbox = createMailbox(sandbox);
		const identity = coreIdentity();
		mailbox.putInbox({ id: "receipt-normal", action: "shellCommand" });
		assert.equal(mailbox.noteParentCustody("receipt-normal", identity), true);
		const notices = [];
		const parent = ParentProgress.create({ notify: value => notices.push(value) || true });
		const child = ChildCustody.createCustody({
			mailbox, parent: { noteCustody: () => true },
			state: { generation: 4, childIncarnationId: "child-normal" }
		});
		const request = { id: "receipt-normal", connectionCustody: identity };
		assert.equal(parent.progress(request, "lane_running", { consumerStarted: false }), true);
		assert.equal(child.noteCustodyProgress("receipt-normal", notices.pop()), true);
		assert.equal(record(mailbox).phase, "queued");

		assert.equal(parent.progress(request, "executor_worker_assigned", { workerId: "worker-normal" }), true);
		const assigned = notices.pop();
		assert.equal(child.noteCustodyProgress("receipt-normal", assigned), true);
		assert.equal(record(mailbox).phase, "worker_starting");
		assert.equal(record(mailbox).workerId, "worker-normal");

		assert.equal(parent.progress(request, "command_handler_started", {
			workerId: "worker-normal", consumerStarted: true
		}), true);
		const running = notices.pop();
		assert.equal(child.noteCustodyProgress("receipt-normal", running), true);
		assert.equal(record(mailbox).phase, "running");
		assert.equal(record(mailbox).workerId, "worker-normal");
		for (const mutation of [
			{ controlRequestId: "wrong-control" }, { generation: 5 },
			{ childIncarnationId: "child-stale" }, { logicalAgentId: "injected-agent" }
		]) {
			assert.equal(child.noteCustodyProgress("receipt-normal", { ...running, ...mutation }), false);
		}
	} finally {
		fs.rmSync(sandbox, { recursive: true, force: true });
	}
});

function createMailbox(sandbox) {
	const root = path.join(sandbox, "project");
	fs.mkdirSync(root, { recursive: true });
	return Mailbox.createMailbox({
		deviceStateRoot: path.join(sandbox, "state"), root,
		tunnelName: "awt-nonmission-custody"
	});
}

function coreIdentity() {
	return {
		requestId: "request-normal", requestKey: "request-normal",
		controlRequestId: "control-normal", transportReceiptId: "receipt-normal",
		generation: 4, childIncarnationId: "child-normal"
	};
}

function record(mailbox) {
	return mailbox.snapshot().inbox.parentCustodyRecords[0];
}
