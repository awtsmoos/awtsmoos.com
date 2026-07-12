// B"H
const test = require("node:test");
const assert = require("node:assert/strict");
const path = require("node:path");
const Command = require("../../command/index.js");

function runner(options = {}) {
	return Command.createCommandRunner({
		maxActive: 4,
		maxQueued: 40,
		maxPerOwner: 20,
		maxOutputBytes: 1024,
		cleanup: { graceMs: 100, pollMs: 10 },
		...options
	});
}

async function waitFor(runtime, jobId, predicate, timeoutMs = 3000) {
	const deadline = Date.now() + timeoutMs;
	while (Date.now() < deadline) {
		const status = runtime.status(jobId);
		if (predicate(status)) return status;
		await new Promise(resolve => setTimeout(resolve, 10));
	}
	throw new Error(`condition_timeout:${jobId}`);
}

test("runner completes and preserves output", async () => {
	const runtime = runner();
	const started = runtime.start({ command: "printf 'hello\\n'", ownerId: "agent-a" });
	const result = await runtime.wait(started.job.jobId);
	assert.equal(result.status, "completed");
	assert.equal(runtime.output(result.jobId, "stdout"), "hello\n");
	assert.equal(runtime.snapshot().admission.active, 0);
	assert.equal(runtime.snapshot().registry.active, 0);
});

test("runner coalesces identical start and rejects changed command", async () => {
	const runtime = runner();
	const first = runtime.start({ command: "sleep 0.05", idempotencyKey: "same", ownerId: "agent-a" });
	const second = runtime.start({ command: "sleep 0.05", idempotencyKey: "same", ownerId: "agent-b" });
	assert.equal(second.kind, "coalesced");
	assert.equal(second.job.jobId, first.job.jobId);
	assert.equal(runtime.start({ command: "printf changed", idempotencyKey: "same" }).error, "idempotency_conflict");
	await runtime.wait(first.job.jobId);
});

test("runner bounds retained output while counting all bytes", async () => {
	const runtime = runner({ maxOutputBytes: 16 });
	const started = runtime.start({ command: "printf '1234567890abcdefghij'" });
	const result = await runtime.wait(started.job.jobId);
	assert.equal(result.output.stdout.totalBytes, 20);
	assert.equal(result.output.stdout.storedBytes, 16);
	assert.equal(result.output.stdout.truncated, true);
	assert.equal(runtime.output(result.jobId, "stdout"), "567890abcdefghij");
});

test("cancellation escalates for a TERM-resistant process family", async () => {
	if (process.platform === "win32") return;
	const runtime = runner();
	const fixture = path.join(__dirname, "fixtures", "stubbornFamily.cjs");
	const started = runtime.start({ command: `${JSON.stringify(process.execPath)} ${JSON.stringify(fixture)}` });
	await waitFor(runtime, started.job.jobId, status => {
		return status?.status === "running" && runtime.output(started.job.jobId, "stdout").includes('"ready":true');
	});
	const result = await runtime.cancel(started.job.jobId);
	assert.equal(result.status, "cancelled");
	assert.equal(result.cleanup.state, "cleaned");
	assert.ok(result.cleanup.signals.includes("SIGTERM"));
	assert.ok(result.cleanup.signals.includes("SIGKILL"));
	assert.equal(runtime.snapshot().admission.active, 0);
	assert.equal(runtime.snapshot().registry.active, 0);
});

test("timeout owns terminal result before close event", async () => {
	const runtime = runner();
	const command = `${JSON.stringify(process.execPath)} -e ${JSON.stringify("setInterval(()=>{},1000)")}`;
	const started = runtime.start({ command, timeoutMs: 80 });
	const result = await runtime.wait(started.job.jobId);
	assert.equal(result.status, "timed_out");
	assert.equal(result.cleanup.state, "cleaned");
	assert.equal(runtime.snapshot().admission.active, 0);
});

test("queued cancellation never spawns", async () => {
	const runtime = runner({ maxActive: 1 });
	const first = runtime.start({ command: "sleep 0.2", ownerId: "a" });
	const second = runtime.start({ command: "printf should-not-run", ownerId: "b" });
	const cancelled = await runtime.cancel(second.job.jobId);
	assert.equal(cancelled.status, "cancelled");
	assert.equal(cancelled.startedAt, null);
	await runtime.wait(first.job.jobId);
	assert.equal(runtime.snapshot().queue.queued, 0);
});
