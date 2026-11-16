// B"H
// Boruch Hashem
// Blessed is He

"use strict";

const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");
const { buildActions } = require("../tools/fs/actions.js");
const { verifyPriority } = require("./helpers/isolatedStressPriority.cjs");

/**
 * @file Isolated tunnel process, cancellation, and paging stress test.
 * @description
 * The Awtsmoos sends each command toward the light;
 * Awtsmoos.com cancels its children before the vessel leaves the night.
 */
const owner = {
	agentSessionId: "stress-session",
	logicalAgentId: "stress-agent"
};

/**
 * Build actions limited to a disposable test root.
 * @param {string} root - Temporary project root.
 * @param {object} payload - Action parameters.
 * @returns {object} Authorized filesystem action handlers.
 */
function actions(root, payload) {
	const config = {
		root,
		allowCommands: true,
		allowWrite: true,
		allowSecrets: false,
		tools: { command: true, fsRead: true, fsWrite: true, fsBulk: true }
	};
	return buildActions(config, {
		allowCommands: true,
		...owner,
		...payload
	}, null);
}

/** Test polling, priority, cancel and output paging without touching production. */
test("isolated command stress preserves priority and paging", { timeout: 30000 }, async () => {
	const root = fs.mkdtempSync(path.join(os.tmpdir(), "awt-isolated-tunnel-stress-"));
	let jobId = "";
	try {
		fs.mkdirSync(path.join(root, ".git"));
		const node = JSON.stringify(process.execPath);
		const started = await actions(root, {
			action: "commandStart",
			command: `${node} -e "setTimeout(()=>process.stdout.write('done'), 5000)"`,
			cwd: ".",
			timeoutMs: 20000
		}).commandStart();
		assert.equal(started.ok, true, started.error);
		jobId = started.jobId;
		const pollRequests = Array.from({ length: 20 }, () => {
			return actions(root, { action: "commandStatus", jobId }).commandStatus();
		});
		const polls = await Promise.all(pollRequests);
		assert.equal(polls.length, 20);
		assert(polls.every(poll => poll.ok === true));
		verifyPriority(owner);
		const canceled = await actions(root, { action: "commandCancel", jobId }).commandCancel();
		assert.equal(canceled.ok, true);
		jobId = "";
		const huge = await actions(root, {
			action: "command",
			command: `${node} -e "process.stdout.write('x'.repeat(120000))"`,
			cwd: ".",
			inline: true,
			maxChars: 4000,
			maxBytes: 200000
		}).command();
		assert.equal(huge.ok, true, huge.error);
		assert.equal(huge.outputPaged, true);
		assert(huge.stdout.length <= 4000);
		assert(huge.nextStdoutPagePayload);
		const page = await actions(root, huge.nextStdoutPagePayload).commandOutputPage();
		assert.equal(page.ok, true);
		assert(page.returnedChars > 0);
	} finally {
		if (jobId) {
			await actions(root, { action: "commandCancel", jobId }).commandCancel();
		}
		fs.rmSync(root, { recursive: true, force: true });
	}
});
