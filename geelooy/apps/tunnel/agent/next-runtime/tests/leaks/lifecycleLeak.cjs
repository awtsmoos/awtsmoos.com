// B"H
const assert = require("node:assert/strict");
const Runtime = require("../../index.js");
const F = require("../helpers/fixtures.cjs");

async function main() {
	await verifySerialCleanup();
	await verifyPriorityCleanup();
	verifyResourceBound();
	verifyQuarantineBound();
	verifyOperationBound();
	console.log(JSON.stringify({ ok: true, cycles: 5000 }));
}

async function verifySerialCleanup() {
	const serial = Runtime.createKeyedSerial();
	await Promise.all(Array.from({ length: 2000 }, (_, index) => serial.run(`key-${index}`, async () => index)));
	assert.equal(serial.snapshot().keys, 0);
	assert.equal(serial.snapshot().waiting, 0);
	assert.equal(serial.snapshot().active, 0);
}

async function verifyPriorityCleanup() {
	const lanes = Runtime.createPriorityLanes();
	await Promise.all(Array.from({ length: 2000 }, (_, index) => lanes.submit(index % 2 ? "P3" : "P4", async () => index)));
	const snapshot = lanes.snapshot();
	assert.equal(snapshot.totalInflight, 0);
	assert.ok(Object.values(snapshot.queued).every(count => count === 0));
}

function verifyResourceBound() {
	const ledger = Runtime.createResourceLedger({ maxResources: 32 });
	for (let index = 0; index < 5000; index += 1) {
		let record = ledger.register({
			resourceId: `resource-${index}`,
			resourceType: "timer",
			ownerType: "test",
			ownerId: "leak-runner",
			cleanupMethod: "clearTimeout"
		});
		record = ledger.requestCleanup(record.resourceId, {}, record.revision);
		ledger.completeCleanup(record.resourceId, { ok: true }, record.revision);
	}
	assert.equal(ledger.snapshot().active, 0);
	assert.ok(ledger.snapshot().total <= 32);
}

function verifyQuarantineBound() {
	const quarantine = Runtime.createQuarantineLedger({ maxEntries: 64, maxBytes: 32768 });
	for (let index = 0; index < 5000; index += 1) quarantine.add({ reason: "test", index });
	assert.ok(quarantine.snapshot().entries <= 64);
	assert.ok(quarantine.snapshot().bytes <= 32768);
	assert.ok(quarantine.snapshot().dropped > 0);
}

function verifyOperationBound() {
	const store = Runtime.createMemoryOperationStore({ maxOperations: 64 });
	const quarantine = Runtime.createQuarantineLedger();
	const coordinator = Runtime.createOperationCoordinator({ store, quarantine });
	for (let index = 0; index < 1000; index += 1) {
		const input = F.request(`leak-${index}`);
		const accepted = coordinator.accept(input);
		coordinator.markSent(accepted.operation.operationId);
		coordinator.receive(F.response(input));
	}
	assert.equal(coordinator.snapshot().active, 0);
	assert.ok(coordinator.snapshot().operations <= 64);
	assert.equal(coordinator.snapshot().waiterGroups, 0);
}

main().catch(error => {
	console.error(error.stack || error);
	process.exitCode = 1;
});
