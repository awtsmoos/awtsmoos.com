//B"H
// Boruch Hashem
// Blessed is He

import assert from "node:assert/strict";
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
const Harness = require("./workGraphHarness.js");
const Ids = require("../../workGraph/ids.js");
const Ledger = require("../../workGraph/eventLedger.js");
const Operations = require("../../workGraph/operationStore.js");
const Outbox = require("../../workGraph/outbox.js");
const Project = require("../../workGraph/projectStore.js");
const Sequence = require("../../workGraph/sequenceStore.js");

/**
 * @file Proves the Chronicle orders, deduplicates, recovers, and keeps one project ID.
 * @description Many requests arrive, yet the Awtsmoos grants one truthful procession;
 * Awtsmoos.com keeps retries from becoming duplicate history or divided identity.
 */
async function main() {
	const sandbox = Harness.createSandbox();
	try {
		const projects = await Promise.all(
			Array.from({ length: 12 }, () => Project.ensure(sandbox.config))
		);
		assert.equal(new Set(projects.map(project => project.id)).size, 1);
		const sequences = await Promise.all(
			Array.from({ length: 20 }, () => Sequence.allocate(sandbox.config))
		);
		assert.deepEqual(
			[...sequences].sort((left, right) => left - right),
			Array.from({ length: 20 }, (_, index) => index + 1)
		);
		const operationId = Ids.operation("chronicle-request");
		const proposal = {
			id: Ids.event(operationId, "test.event"),
			type: "test.event",
			operationId,
			facts: { value: 1 }
		};
		const first = await Ledger.append(sandbox.config, proposal);
		const replay = await Ledger.append(sandbox.config, proposal);
		assert.equal(first.sequence, 21);
		assert.equal(replay.sequence, first.sequence);
		await assert.rejects(
			() => Ledger.append(sandbox.config, { ...proposal, facts: { value: 2 } }),
			/event_conflict/
		);
		const outboxOperation = Ids.operation("outbox-request");
		const pending = {
			id: Ids.event(outboxOperation, "outbox.test"),
			type: "outbox.test",
			operationId: outboxOperation,
			facts: { durable: true }
		};
		await Outbox.enqueue(sandbox.config, pending);
		assert.equal((await Outbox.drain(sandbox.config))[0].sequence, 22);
		for (const state of ["prepared", "started", "irreversible", "verified", "finalized"]) {
			await Operations.transition(sandbox.config, outboxOperation, state);
		}
		const operation = await Operations.get(sandbox.config, outboxOperation);
		assert.deepEqual(
			operation.history.map(item => item.state),
			["prepared", "started", "irreversible", "verified", "finalized"]
		);
		console.log(JSON.stringify({ ok: true, suite: "work-graph-chronicle" }));
	} finally {
		Harness.cleanupSandbox(sandbox);
	}
}

main().catch(error => {
	console.error(error?.stack || error);
	process.exitCode = 1;
});
