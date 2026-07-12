// B"H
const test = require("node:test");
const assert = require("node:assert/strict");
const childProcess = require("node:child_process");
const path = require("node:path");
const F = require("../helpers/fixtures.cjs");

test("operation identity survives a separate worker process", async t => {
	const worker = childProcess.fork(path.join(__dirname, "worker.cjs"), [], {
		stdio: ["ignore", "ignore", "inherit", "ipc"]
	});
	const pending = new Map();
	let sequence = 0;
	worker.on("message", message => {
		const waiter = pending.get(message.callId);
		if (!waiter) return;
		pending.delete(message.callId);
		message.ok ? waiter.resolve(message.result) : waiter.reject(Object.assign(new Error(message.error.message), message.error));
	});
	t.after(async () => {
		if (worker.connected) await call("exit").catch(() => {});
	});

	function call(action, payload = {}) {
		const callId = `call-${++sequence}`;
		return new Promise((resolve, reject) => {
			pending.set(callId, { resolve, reject });
			worker.send({ callId, action, ...payload });
		});
	}

	const accepted = [];
	for (let index = 0; index < 50; index += 1) {
		const input = F.request(`cross-${index}`);
		const result = await call("accept", { request: input });
		await call("markSent", { operationId: result.operation.operationId });
		accepted.push(input);
	}

	const wrong = await call("receive", {
		response: F.response(accepted[0], { transportSessionId: "stale-session" })
	});
	assert.equal(wrong.error, "correlation_mismatch");

	for (let index = accepted.length - 1; index >= 0; index -= 1) {
		const result = await call("receive", { response: F.response(accepted[index]) });
		assert.equal(result.kind, "completed");
	}

	const snapshot = await call("snapshot");
	assert.equal(snapshot.active, 0);
	assert.equal(snapshot.quarantine.entries, 1);
});
