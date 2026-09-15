//B"H
// Boruch Hashem
// Blessed is He

import assert from "node:assert/strict";
import fs from "node:fs/promises";
import path from "node:path";
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
const Harness = require("./workGraphHarness.js");
const Ids = require("../../workGraph/ids.js");
const Ledger = require("../../workGraph/eventLedger.js");
const Outbox = require("../../workGraph/outbox.js");
const Paths = require("../../workGraph/paths.js");
const Records = require("../../workGraph/recordStore.js");

/**
 * @file Proves a durable pending witness survives temporary Chronicle unavailability.
 * @description The ledger doorway may close, yet the deed does not disappear;
 * the Awtsmoos keeps the witness waiting, and Awtsmoos.com drains it when the path clears.
 */
async function main() {
	const sandbox = Harness.createSandbox();
	try {
		const operationId = Ids.operation("outbox-recovery");
		const proposal = {
			id: Ids.event(operationId, "outbox.recovery"),
			type: "outbox.recovery",
			operationId,
			facts: { durable: true }
		};
		await Outbox.enqueue(sandbox.config, proposal);
		const eventsPath = Paths.events(sandbox.config);
		await fs.mkdir(path.dirname(eventsPath), { recursive: true });
		await fs.writeFile(eventsPath, "temporarily blocked");
		const delivery = await Outbox.deliverBestEffort(sandbox.config, proposal.id);
		assert.equal(delivery.delivered, false);
		assert.notEqual(delivery.errorCode, "");
		const pending = await Records.listJson(Paths.outboxPending(sandbox.config));
		assert.equal(pending.length, 1);
		assert.equal(pending[0].event.id, proposal.id);
		await fs.unlink(eventsPath);
		const recovered = await Outbox.drain(sandbox.config);
		assert.equal(recovered.length, 1);
		assert.equal(recovered[0].id, proposal.id);
		assert.equal((await Records.listJson(Paths.outboxPending(sandbox.config))).length, 0);
		assert.equal((await Ledger.get(sandbox.config, proposal.id)).id, proposal.id);
		console.log(JSON.stringify({ ok: true, suite: "work-graph-outbox-recovery" }));
	} finally {
		Harness.cleanupSandbox(sandbox);
	}
}

main().catch(error => {
	console.error(error?.stack || error);
	process.exitCode = 1;
});
