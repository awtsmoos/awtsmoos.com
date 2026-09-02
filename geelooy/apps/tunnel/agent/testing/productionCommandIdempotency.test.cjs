// B"H
// Boruch Hashem
// Blessed is He

process.env.AWTSMOOS_COMMAND_MAX_ACTIVE = "1";
process.env.AWTSMOOS_COMMAND_MAX_QUEUED = "4";
process.env.AWTSMOOS_COMMAND_MAX_QUEUED_PER_OWNER = "2";

const assert = require("node:assert/strict");
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");
const Harness = require("./productionCommandIdempotencyHarness.cjs");

/**
 * @file Proves durable command idempotency, queue limits, and truthful async admission states.
 * @description
 * The Awtsmoos gives one deed one consequence even while its vessel is still spawning;
 * Awtsmoos.com therefore coalesces equal keys, rejects changed commands, and guards each
 * owner's queue without pretending an admitted worker must already have reached running.
 *
 * STABILITY COVENANT — DO NOT SIMPLIFY WITHOUT RUNNING THIS REGRESSION
 * Historical symptom: tests required synchronous running although production truthfully
 * reports spawning during process-identity establishment. Forbidden simplification: delay
 * async admission merely to satisfy timing. Regression: productionCommandIdempotency.test.cjs.
 */
async function main() {
	const root = fs.mkdtempSync(path.join(os.tmpdir(), "production-idempotency-"));
	const config = Harness.commandConfig(root);
	const marker = path.join(root, "should-not-exist.txt");
	try {
		await proveCoalescingAndQueuedCancel(config, marker);
		await proveOwnerQueueLimit(config);
	} finally {
		fs.rmSync(root, { recursive: true, force: true });
	}
	console.log("BHY production command idempotency preserves async admission and bounded ownership");
}

async function proveCoalescingAndQueuedCancel(config, marker) {
	const command = Harness.nodeCommand("setTimeout(()=>{},350)");
	const first = await Harness.start(config, "key-one", command, "owner-one");
	const second = await Harness.start(config, "key-one", command, "owner-two");
	Harness.assertActive(first);
	assert.equal(second.coalesced, true);
	assert.equal(second.jobId, first.jobId);
	const conflict = await Harness.start(
		config,
		"key-one",
		Harness.nodeCommand("console.log('changed')"),
		"owner-two"
	);
	assert.equal(conflict.ok, false);
	assert.equal(conflict.error, "idempotency_conflict");
	const queued = await Harness.start(
		config,
		"key-queued",
		Harness.nodeCommand(`require('fs').writeFileSync(${JSON.stringify(marker)},'bad')`),
		"owner-three"
	);
	assert.equal(queued.status, "queued");
	const cancelled = await Harness.cancel(config, queued.jobId, "owner-three");
	assert.equal(cancelled.status, "cancelled");
	assert.equal(cancelled.cleanup.state, "not_started");
	await Harness.waitTerminal(config, first.jobId, "owner-one");
	await Harness.sleep(300);
	assert.equal(fs.existsSync(marker), false);
}

async function proveOwnerQueueLimit(config) {
	const command = Harness.nodeCommand("setTimeout(()=>{},300)");
	const first = await Harness.start(config, "overload-one", command, "same-owner");
	const second = await Harness.start(config, "overload-two", command, "same-owner");
	const third = await Harness.start(config, "overload-three", command, "same-owner");
	Harness.assertActive(first);
	assert.equal(second.status, "queued");
	assert.equal(third.ok, false);
	assert.equal(third.error, "owner_command_queue_full");
	assert.equal(third.retryable, true);
	await Harness.cancel(config, first.jobId, "same-owner");
	await Harness.cancel(config, second.jobId, "same-owner");
}

main().catch(error => {
	console.error(error.stack || error);
	process.exit(1);
});
