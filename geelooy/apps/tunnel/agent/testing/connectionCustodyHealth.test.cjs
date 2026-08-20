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
 * @file Proves durable replay testimony cannot masquerade as stale current-generation custody.
 * @description
 * The Awtsmoos remembers an ancient deed without aging the hand that receives it anew;
 * Awtsmoos.com repairs only work held too long by today's parent, preserving replay and liveness as one truth.
 */
test("mailbox custody age begins at current parent ACK, not durable receipt creation", () => {
	const sandbox = fs.mkdtempSync(path.join(os.tmpdir(), "awts-custody-health-"));
	let clock = 1_000_000;
	const config = {
		deviceStateRoot: path.join(sandbox, "state"),
		root: path.join(sandbox, "project"),
		tunnelName: "awt-custody-health"
	};
	try {
		fs.mkdirSync(config.root, { recursive: true });
		const first = Mailbox.createMailbox(config, { now: () => clock });
		first.putInbox({ id: "old-replay", action: "read" });
		clock += 120_000;
		const recovered = Mailbox.createMailbox(config, { now: () => clock });
		let inbox = recovered.snapshot().inbox;
		assert.equal(inbox.count, 1);
		assert.equal(inbox.parentCustodyCount, 0);
		assert.equal(inbox.parentCustodyOldestAgeMs, 0);
		recovered.noteParentCustody("old-replay");
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

test("consumer health ignores ancient unowned replay but repairs stale owned work", () => {
	const stats = {
		lanes: {
			p1_fs_light: { inflight: 0, queued: 1, oldestQueuedAgeMs: 60_000 }
		},
		executionStages: { waitingForConsumer: 0 },
		filesystemExecutor: { busy: 0, ready: 2, workers: 2 }
	};
	let result = ConsumerHealth.inspect(stats, {
		inbox: {
			count: 9,
			oldestAgeMs: 7_000_000,
			parentCustodyCount: 0,
			parentCustodyOldestAgeMs: 0
		}
	}, { registered: true, consumerStaleMs: 30_000 });
	assert.equal(result.healthy, true);
	assert.equal(result.unresolved, 0);
	assert.equal(result.durableUnresolved, 9);
	result = ConsumerHealth.inspect(stats, {
		inbox: {
			count: 9,
			oldestAgeMs: 7_000_000,
			parentCustodyCount: 1,
			parentCustodyOldestAgeMs: 60_000
		}
	}, { registered: true, consumerStaleMs: 30_000 });
	assert.equal(result.consumerStalled, true);
	assert.equal(result.unresolved, 1);
});

test("watchdog does not replace parent for old replay testimony without current custody", () => {
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
		inbox: {
			count: 3,
			oldestAgeMs: 60_000,
			parentCustodyCount: 0,
			parentCustodyOldestAgeMs: 0
		}
	});
	assert.equal(result.shouldRepair, false);
	assert.equal(signals.length, 0);
});
