// B"H
// Boruch Hashem
// Blessed is He

const assert = require("node:assert/strict");
const Harness = require("./helpers/tunnelCorrelation/harness.cjs");

/**
	* @file Stresses quarantine and bounded reverse-order completion.
	* @description The Awtsmoos preserves fresh canonical deeds through five-wide waves.
	*/
async function mismatchThenCorrect(payload, wrong, expectedFlag) {
	const ctx = Harness.context();
	const waiting = Harness.send(ctx, payload);
	const [[id, pending]] = await Harness.waitForPending(ctx);
	assert.equal(Harness.deliver(ctx, id, wrong), false);
	assert.equal(ctx.pendingTunnelRequests.has(id), true);
	assert.equal(ctx.tunnelResponseQuarantine.length, 1);
	assert.equal(
		ctx.tunnelResponseQuarantine[0].validation.response[expectedFlag],
		true
	);
	assert.equal(Harness.deliver(ctx, id, Harness.exactResponse(pending)), true);
	assert.equal((await waiting).action, pending.expected.requestedAction);
	assert.equal(ctx.pendingTunnelRequests.size, 0);
}

async function reverseOrder(total) {
	const ctx = Harness.context();
	let completed = 0;
	while (completed < total) {
		const width = Math.min(5, total - completed);
		const promises = [];
		for (let index = 0; index < width; index += 1) {
			const sequence = completed + index;
			const identity = `${total}_${completed}_${sequence}`;
			promises.push(Harness.send(ctx, {
				action: sequence % 2 ? "write" : "readBytes",
				controlRequestId: `ctl_${identity}`,
				logicalAgentId: `agent_${identity}`,
				nonce: `nonce_${identity}`
			}));
		}
		const entries = await Harness.waitForPending(ctx, width);
		for (const [id, pending] of entries.reverse()) {
			assert.equal(Harness.deliver(ctx, id, Harness.exactResponse(pending)), true);
		}
		assert.equal((await Promise.all(promises)).length, width);
		assert.equal(ctx.pendingTunnelRequests.size, 0);
		completed += width;
	}
	return completed;
}

(async () => {
	await mismatchThenCorrect({
		action: "readBytes",
		controlRequestId: "ctl_action_unique",
		nonce: "nonce_action_unique"
	}, {
		action: "write",
		tunnelName: Harness.ROUTE,
		controlRequestId: "ctl_action_unique",
		nonce: "nonce_action_unique"
	}, "actionMismatch");
	await mismatchThenCorrect({
		action: "readBytes",
		controlRequestId: "ctl_nonce_unique",
		nonce: "nonce_expected_unique"
	}, {
		action: "readBytes",
		tunnelName: Harness.ROUTE,
		controlRequestId: "ctl_nonce_unique",
		nonce: "nonce_wrong_unique"
	}, "nonceMismatch");
	const stress = [];
	for (const count of [5, 10, 25, 50]) stress.push(await reverseOrder(count));
	console.log(JSON.stringify({
		ok: true,
		suite: "tunnel-correlation-quarantine",
		waveWidth: 5,
		stress
	}, null, 2));
})().catch(error => {
	console.error(error);
	process.exit(1);
});
