// B"H

const assert = require("assert");
const Queue = require("../tools/chrome/actionQueue.js");
const { actionQueueTimeout } = require("../tools/chrome/index.js");
const Scope = require("../tools/chrome/scopePolicy.js");

function sleep(milliseconds) {
	return new Promise(resolve => setTimeout(resolve, milliseconds));
}

(async () => {
	Queue.resetForTests();
	let active = 0;
	let maximumActive = 0;
	const results = await Promise.all(Array.from({ length: 120 }, (_, index) => Queue.run(async () => {
		active += 1;
		maximumActive = Math.max(maximumActive, active);
		await sleep(index % 4);
		active -= 1;
		return index;
	})));
	assert.equal(results.length, 120);
	assert.equal(maximumActive, 1, "single CDP socket actions must not overlap");
	assert.equal(Queue.snapshot().active, 0);
	assert.equal(Queue.snapshot().queued, 0);
	assert.equal(Queue.snapshot().completed, 120);
	assert.equal(actionQueueTimeout({ timeoutMs: 20000 }), 30000);
	assert.equal(actionQueueTimeout({ timeoutMs: 20000, queueTimeoutMs: 45000 }), 45000);
	assert.equal(Scope.hasScope({ agentSessionId: "agent-session" }), true);
	assert.equal(Scope.hasScope({}), false);
	assert.equal(Scope.scopeRequiredEnvelope("chromeTargetAcquire", {}).error, "missing_browser_scope");
	console.log(JSON.stringify({ ok: true, operations: 120, maximumActive, queue: Queue.snapshot() }, null, 2));
})().catch(error => {
	console.error(error.stack || error.message);
	process.exit(1);
});
