// B"H
const assert = require("assert");
const Transaction = require("../../mission/transaction/index.js");

function sleep(milliseconds) {
	return new Promise(resolve => setTimeout(resolve, milliseconds));
}

(async () => {
	Transaction.resetForTests();
	const config = { root: "/tmp/awtsmoos-transaction-stress" };
	const shared = { value: 0, active: 0, maxActive: 0 };
	const calls = Array.from({ length: 300 }, (_, index) => Transaction.run(config, {
		action: "missionRoomMessage",
		missionId: "one-mission",
		agentId: `agent-${index}`
	}, async () => {
		shared.active += 1;
		shared.maxActive = Math.max(shared.maxActive, shared.active);
		const before = shared.value;
		await sleep(index % 3);
		shared.value = before + 1;
		shared.active -= 1;
	}));
	await Promise.all(calls);
	assert.equal(shared.value, 300, "serialized mission mutations must not lose updates");
	assert.equal(shared.maxActive, 1, "one mission must have one active writer");
	assert.equal(Transaction.snapshot().keys, 0, "completed mission queues must be deleted");

	let globalActive = 0;
	let globalMax = 0;
	await Promise.all(Array.from({ length: 80 }, (_, index) => Transaction.run(config, {
		action: "missionRoomHeartbeat",
		missionId: `mission-${index}`
	}, async () => {
		globalActive += 1;
		globalMax = Math.max(globalMax, globalActive);
		await sleep(5);
		globalActive -= 1;
	})));
	assert(globalMax > 1, "unrelated missions must remain concurrent");
	assert.equal(Transaction.snapshot().keys, 0);

	let statusRan = false;
	await Transaction.run(config, { action: "missionRoomStatus", missionId: "one-mission" }, async () => {
		statusRan = true;
	});
	assert.equal(statusRan, true);
	assert.equal(Transaction.snapshot().totalRuns, 380, "read-only status must bypass serialized metrics");

	console.log(JSON.stringify({
		ok: true,
		serializedMutations: shared.value,
		parallelMissions: 80,
		maxParallelMissions: globalMax,
		metrics: Transaction.snapshot()
	}, null, 2));
})().catch(error => {
	console.error(error.stack || error.message);
	process.exit(1);
});
