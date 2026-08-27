// B"H
const test = require("node:test");
const assert = require("node:assert/strict");
const Command = require("../../command/index.js");

test("admission caps starts and releases idempotently", () => {
	const gate = Command.createAdmission({ maxActive: 2 });
	const first = gate.acquire("one");
	const second = gate.acquire("two");
	assert.equal(gate.acquire("three").error, "command_capacity_reached");
	assert.equal(first.release(), true);
	assert.equal(first.release(), false);
	assert.equal(second.release(), true);
	assert.equal(gate.snapshot().active, 0);
});

test("active registry remains bounded", () => {
	const registry = Command.createActiveRegistry({ maxActive: 1, maxRecent: 2 });
	assert.equal(registry.register({ workerId: "one" }).ok, true);
	assert.equal(registry.register({ workerId: "two" }).error, "worker_registry_full");
	registry.finish("one", { state: "completed" });
	assert.equal(registry.snapshot().active, 0);
});

test("fair queue rotates owners", () => {
	const queue = Command.createFairQueue({ maxQueued: 10, maxPerOwner: 5 });
	queue.enqueue("a", "a1");
	queue.enqueue("a", "a2");
	queue.enqueue("b", "b1");
	assert.deepEqual([queue.dequeue().item, queue.dequeue().item, queue.dequeue().item], ["a1", "b1", "a2"]);
});

test("idempotency coalesces identical and rejects conflict", () => {
	const ledger = Command.createIdempotencyLedger();
	assert.equal(ledger.begin({ idempotencyKey: "key", requestHash: "a", jobId: "one" }).kind, "created");
	assert.equal(ledger.begin({ idempotencyKey: "key", requestHash: "a", jobId: "two" }).kind, "coalesced");
	assert.equal(ledger.begin({ idempotencyKey: "key", requestHash: "b", jobId: "two" }).error, "idempotency_conflict");
});

test("output counters bound stored bytes", () => {
	const output = Command.createOutputCounters({ maxBytes: 5 });
	output.append("stdout", "1234");
	output.append("stdout", "5678");
	assert.equal(output.read("stdout"), "45678");
	assert.deepEqual(output.snapshot().stdout, {
		totalBytes: 8,
		totalChars: 8,
		storedBytes: 5,
		omittedBytes: 3,
		chunks: 2,
		truncated: true
	});
});

test("process identity rejects recycled PID", () => {
	const expected = { pid: 42, processGroupId: 42, birthToken: "old" };
	const observed = { alive: true, pid: 42, processGroupId: 42, birthToken: "new" };
	assert.equal(Command.identity.compareProcess(expected, observed).reason, "birth_token_mismatch");
});

test("terminal command cannot resurrect", () => {
	let record = { status: "created", revision: 0, history: [] };
	record = Command.transitions.transition(record, "spawning");
	record = Command.transitions.transition(record, "running");
	record = Command.transitions.transition(record, "completed");
	assert.throws(() => Command.transitions.transition(record, "running"), { code: "invalid_command_transition" });
});

test("signal permission race becomes cleanup receipt instead of exception", async () => {
	const expected = { pid: 42, processGroupId: 42, birthToken: "birth" };
	const result = await Command.processControl.cleanupProcess(expected, {
		observe: () => ({ alive: true, pid: 42, processGroupId: 42, birthToken: "birth" }),
		groupAlive: () => true,
		signalGroup: (_identity, signal) => ({ sent: false, absent: false, errorCode: "EPERM", signal }),
		graceMs: 1,
		pollMs: 1
	});
	assert.equal(result.state, "cleanup_failed");
	assert.equal(result.error, "signal_failed:EPERM");
	assert.equal(result.attempts.length, 1);
});

test("signal race is clean when group vanished before delivery", async () => {
	const expected = { pid: 42, processGroupId: 42, birthToken: "birth" };
	const result = await Command.processControl.cleanupProcess(expected, {
		observe: () => ({ alive: true, pid: 42, processGroupId: 42, birthToken: "birth" }),
		groupAlive: () => false,
		signalGroup: (_identity, signal) => ({ sent: false, absent: false, errorCode: "EPERM", signal }),
		graceMs: 1,
		pollMs: 1
	});
	assert.equal(result.state, "cleaned");
});
