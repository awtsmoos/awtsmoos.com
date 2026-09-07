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
 * @file Proves ordinary tunnel work advances custody without fabricated mission identity.
 * @description
 * The Awtsmoos names an ordinary deed completely through request, control, generation,
 * and incarnation. Awtsmoos.com accepts absent mission dimensions on both sides while
 * still fencing stale children, wrong generations, wrong controls, and injected shlichus.
 */
test("non-mission custody reaches running under the exact core fence", () => {
	const sandbox = fs.mkdtempSync(path.join(os.tmpdir(), "awts-nonmission-custody-"));
	try {
		const mailbox = createMailbox(sandbox);
		const identity = coreIdentity();
		mailbox.putInbox({ id: "receipt-normal", action: "shellCommand" });
		assert.equal(mailbox.noteParentCustody("receipt-normal", identity), true);
		const notices = [];
		const parent = ParentProgress.create({ notify: value => notices.push(value) || true });
		const child = ChildCustody.createCustody({
			mailbox,
			parent: { noteCustody: () => true },
			state: { generation: 4, childIncarnationId: "child-normal" }
		});

		assert.equal(parent.progress({
			id: "receipt-normal",
			connectionCustody: identity
		}, "lane_running", { consumerStarted: false }), true);
		assert.equal(child.noteCustodyProgress("receipt-normal", notices.pop()), true);
		assert.equal(record(mailbox).phase, "queued");

		assert.equal(parent.progress({
			id: "receipt-normal",
			connectionCustody: identity
		}, "executor_worker_assigned", { workerId: "worker-normal" }), true);
		const running = notices.pop();
		assert.equal(child.noteCustodyProgress("receipt-normal", running), true);
		assert.equal(record(mailbox).phase, "running");
		assert.equal(record(mailbox).workerId, "worker-normal");
		assert.equal(child.noteCustodyProgress("receipt-normal", {
			...running,
			controlRequestId: "wrong-control"
		}), false);
		assert.equal(child.noteCustodyProgress("receipt-normal", {
			...running,
			generation: 5
		}), false);
		assert.equal(child.noteCustodyProgress("receipt-normal", {
			...running,
			childIncarnationId: "child-stale"
		}), false);
		assert.equal(child.noteCustodyProgress("receipt-normal", {
			...running,
			logicalAgentId: "injected-agent"
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
		tunnelName: "awt-nonmission-custody"
	});
}

function coreIdentity() {
	return {
		requestId: "request-normal",
		requestKey: "request-normal",
		controlRequestId: "control-normal",
		transportReceiptId: "receipt-normal",
		generation: 4,
		childIncarnationId: "child-normal"
	};
}

function record(mailbox) {
	return mailbox.snapshot().inbox.parentCustodyRecords[0];
}
