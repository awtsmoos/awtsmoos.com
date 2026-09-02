// B"H
// Boruch Hashem
// Blessed is He

const assert = require("node:assert/strict");
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");
const test = require("node:test");
const Mailbox = require("../lib/connection-vessel/mailbox.js");
const ConsumerHealth = require("../lib/connection-vessel/parent-consumer-health.js");
const Watchdog = require("../lib/connection-vessel/parent-watchdog.js");

/**
 * @file Proves replay age, exact current custody, and parent repair remain separate truths.
 * @description
 * The Awtsmoos remembers old deeds without calling them present ownership. Awtsmoos.com
 * binds living custody to exact incarnation testimony, so ancient replay stays durable
 * while only today's accepted deed can age into a consumer-stall witness.
 */
test("custody age begins at current exact parent ACK, not durable creation", () => {
	const sandbox = fs.mkdtempSync(path.join(os.tmpdir(), "awts-custody-health-"));
	let clock = 1_000_000;
	const config = configuration(sandbox);
	try {
		const first = mailbox(config, () => clock);
		first.putInbox({ id: "old-replay", action: "read" });
		clock += 120_000;
		const recovered = mailbox(config, () => clock);
		let inbox = recovered.snapshot().inbox;
		assert.equal(inbox.count, 1);
		assert.equal(inbox.parentCustodyCount, 0);
		recovered.noteParentCustody("old-replay", identity("old-replay"));
		clock += 500;
		inbox = recovered.snapshot().inbox;
		assert.equal(inbox.parentCustodyCount, 1);
		assert.equal(inbox.parentCustodyOldestAgeMs, 500);
		recovered.acknowledge("old-replay");
		assert.equal(recovered.snapshot().inbox.parentCustodyCount, 0);
	} finally {
		fs.rmSync(sandbox, { recursive: true, force: true });
	}
});

test("ancient unowned replay is healthy while expired exact custody stalls", () => {
	const stats = healthyStats();
	let result = ConsumerHealth.inspect(stats, {
		inbox: { count: 9, oldestAgeMs: 7_000_000, parentCustodyCount: 0,
			parentCustodyOldestAgeMs: 0, parentCustodyRecords: [] }
	}, { registered: true, consumerStaleMs: 30_000 });
	assert.equal(result.healthy, true);
	assert.equal(result.unresolved, 0);
	assert.equal(result.durableUnresolved, 9);

	result = ConsumerHealth.inspect(stats, {
		inbox: { count: 9, oldestAgeMs: 7_000_000, parentCustodyCount: 1,
			parentCustodyOldestAgeMs: 60_000,
			parentCustodyRecords: [{ ...identity("owned"), id: "owned", leaseExpiresAt: 1 }] }
	}, { registered: true, consumerStaleMs: 30_000, orphanRecovery: true, orphanStaleMs: 30_000 });
	assert.equal(result.orphanedCustody, true);
	assert.equal(result.consumerStalled, true);
	assert.equal(result.unresolved, 1);
});

test("watchdog ignores old replay without current custody", () => {
	const signals = [];
	const watchdog = Watchdog.create({
		parentPid: 4242,
		parentStaleMs: 120_000,
		backlogStaleMs: 5_000,
		consumerStaleMs: 5_000,
		startedAt: 1_000,
		now: () => 10_000,
		signal: (pid, signal) => signals.push({ pid, signal }),
		recordLifecycle: () => true,
		setTimer: () => ({ unref() {} })
	});
	const result = watchdog.inspect({ registered: true }, {
		inbox: { count: 3, oldestAgeMs: 60_000, parentCustodyCount: 0,
			parentCustodyOldestAgeMs: 0, parentCustodyRecords: [] }
	});
	assert.equal(result.shouldRepair, false);
	assert.equal(signals.length, 0);
});

function configuration(sandbox) {
	const root = path.join(sandbox, "project");
	fs.mkdirSync(root, { recursive: true });
	return { deviceStateRoot: path.join(sandbox, "state"), root, tunnelName: "awt-custody-health" };
}

function mailbox(config, now) {
	return Mailbox.createMailbox(config, { now, childIncarnationId: "child-current" });
}

function identity(id) {
	return { requestId: id, requestKey: id, logicalAgentId: "agent", agentSessionId: "session",
		controlRequestId: id, generation: 1, childIncarnationId: "child-current" };
}

function healthyStats() {
	return { lanes: {}, executionStages: { active: 0, waitingForConsumer: 0 },
		filesystemExecutor: { busy: 0, queued: 0, ready: 2, workers: 2 } };
}
