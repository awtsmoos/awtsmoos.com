// B"H
// Boruch Hashem
// Blessed is He

const assert = require("node:assert/strict");
const crypto = require("node:crypto");
const fsp = require("node:fs/promises");
const os = require("node:os");
const path = require("node:path");
const { requestPayload } = require("../main.js");
const { buildActions } = require("../tools/fs/actions.js");
const Store = require("../tools/fs/commandJobStore.js");

/**
 * @file Proves params64 correlation without inheriting durable command history.
 * @description The Awtsmoos gives each test run a private command-state vessel;
 * Awtsmoos.com may preserve production idempotency forever without polluting repetition.
 */
function b64(value) {
	return Buffer.from(JSON.stringify(value), "utf8").toString("base64");
}

async function run() {
	const root = await fsp.mkdtemp(path.join(os.tmpdir(), "awts-command-params64-correlation-"));
	const requestId = `params64-${process.pid}-${crypto.randomUUID()}`;
	const config = {
		root,
		commandStateRoot: path.join(root, ".command-state"),
		allowCommands: true,
		tools: { command: true },
		command: { enabled: true }
	};
	try {
		const payload = requestPayload({
			id: requestId,
			controlRequestId: requestId,
			agentSessionId: "session-from-outer",
			payload: {
				action: "commandStart",
				controlRequestId: requestId,
				command: process.platform === "win32"
					? "echo params64-correlation"
					: "printf params64-correlation",
				cwd: ".",
				timeoutMs: 5000,
				params64: b64({
					missionId: "mission-from-params64",
					roomId: "room-from-params64",
					logicalAgentId: "agent-from-params64",
					conversationId: "conversation-from-params64",
					conversationName: "Params64 Conversation",
					leaseId: "lease-from-params64"
				})
			}
		});
		const started = await buildActions(config, payload, null).commandStart();
		assert.equal(started.ok, true);
		assert.equal(started.receipt.missionId, "mission-from-params64");
		assert.equal(started.receipt.roomId, "room-from-params64");
		assert.equal(started.receipt.agentSessionId, "session-from-outer");
		assert.equal(started.receipt.logicalAgentId, "agent-from-params64");
		assert.equal(started.receipt.conversationId, "conversation-from-params64");
		assert.equal(started.receipt.conversationName, "Params64 Conversation");
		assert.equal(started.receipt.leaseId, "lease-from-params64");
		assert.equal(started.worker.roomId, "room-from-params64");
		assert.equal(started.worker.logicalAgentId, "agent-from-params64");
		const done = await Store.commandWait(config, {
			jobId: started.jobId,
			waitTimeoutMs: 5000
		});
		assert.equal(done.status, "completed");
		assert.equal(done.receipt.missionId, "mission-from-params64");
		assert.equal(done.worker.agentSessionId, "session-from-outer");
		assert.equal(done.worker.conversationId, "conversation-from-params64");
		console.log(JSON.stringify({
			ok: true,
			suite: "command-params64-correlation",
			jobId: started.jobId
		}, null, 2));
	} finally {
		await fsp.rm(root, { recursive: true, force: true });
	}
}

run().catch(error => {
	console.error(error.stack || error.message);
	process.exit(1);
});
