// B"H
const assert = require("node:assert/strict");
const Runtime = require("../../index.js");
const F = require("../helpers/fixtures.cjs");

async function main() {
	const total = 1000;
	const store = Runtime.createMemoryOperationStore({ maxOperations: 1500 });
	const quarantine = Runtime.createQuarantineLedger({ maxEntries: 2000, maxBytes: 8 * 1024 * 1024 });
	const coordinator = Runtime.createOperationCoordinator({ store, quarantine, maxWaitersPerOperation: 4 });
	const accepted = [];
	const waiting = [];

	for (let index = 0; index < total; index += 1) {
		const input = F.request(index);
		const result = coordinator.accept(input);
		assert.equal(result.kind, "created");
		coordinator.markSent(result.operation.operationId);
		accepted.push({ input, operation: result.operation });
		waiting.push(coordinator.wait(result.operation.operationId));
	}

	for (let index = 0; index < 100; index += 1) {
		const input = accepted[index].input;
		const wrong = coordinator.receive(F.response(input, { jobId: `wrong-${index}` }));
		assert.equal(wrong.error, "correlation_mismatch");
	}

	for (let index = total - 1; index >= 0; index -= 1) {
		const completed = coordinator.receive(F.response(accepted[index].input));
		assert.equal(completed.kind, "completed");
	}

	const results = await Promise.all(waiting);
	assert.equal(results.length, total);
	assert.ok(results.every(operation => operation.state === "completed"));

	for (let index = 0; index < 50; index += 1) {
		assert.equal(coordinator.receive(F.response(accepted[index].input)).kind, "duplicate_final");
	}

	const duplicate = coordinator.accept({ ...accepted[0].input });
	assert.equal(duplicate.kind, "coalesced");
	const conflict = coordinator.accept({
		...F.request("new-control"),
		idempotencyKey: accepted[0].input.idempotencyKey,
		payload: { changed: true }
	});
	assert.equal(conflict.error, "idempotency_conflict");

	const snapshot = coordinator.snapshot();
	assert.equal(snapshot.active, 0);
	assert.equal(snapshot.quarantine.entries, 100);
	console.log(JSON.stringify({ ok: true, total, snapshot }));
}

main().catch(error => {
	console.error(error.stack || error);
	process.exitCode = 1;
});
