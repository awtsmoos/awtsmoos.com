// B"H
// Boruch Hashem
// Blessed is He

const assert = require("node:assert/strict");
const MetaFactory = require("../tools/fs/commandJob/metaFactory.js");

/**
 * @file Proves queue residence cannot consume a command's execution timeout.
 * @description
 * The Awtsmoos distinguishes waiting from running. Awtsmoos.com preserves the
 * first promise while granting the complete execution lease at physical launch.
 */
function main() {
	const meta = MetaFactory.createMeta({
		jobId: "job-queue-lease",
		workerId: "worker-queue-lease",
		receiptId: "receipt-queue-lease",
		command: "printf B_H",
		cwd: "/tmp",
		shell: "/bin/sh",
		timeoutMs: 60000,
		ids: {},
		config: {
			deviceStateRoot: "/tmp/awts-queue-lease-state"
		},
		payload: {
			action: "commandStart"
		}
	});
	const queuedAt = meta.queuedAt;
	const launchedAt = new Date(
		Date.parse(queuedAt) + 120000
	).toISOString();
	MetaFactory.markLaunched(meta, launchedAt);
	const expectedDeadline = new Date(
		Date.parse(launchedAt) + 60000
	).toISOString();

	assert.equal(meta.queuedAt, queuedAt);
	assert.equal(meta.startedAt, launchedAt);
	assert.equal(meta.executionStartedAt, launchedAt);
	assert.equal(meta.deadlineAt, expectedDeadline);
	assert.equal(meta.leaseExpiresAt, expectedDeadline);
	assert.equal(meta.worker.startedAt, launchedAt);
	assert.equal(meta.worker.heartbeatAt, launchedAt);
	assert.equal(meta.worker.deadlineAt, expectedDeadline);
	assert.equal(meta.queueWaitMs, 120000);
	console.log("queue residence does not consume execution lease");
}

main();
