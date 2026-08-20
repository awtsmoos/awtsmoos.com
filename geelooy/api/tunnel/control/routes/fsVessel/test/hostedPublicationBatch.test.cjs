//B"H
// Boruch Hashem
// Blessed is He

const assert = require("node:assert/strict");
const test = require("node:test");
const {
	dispatchHostedVirtualOs
} = require("../hostedVirtualOs/dispatcher.js");
const {
	HOSTED_BATCH_ACTIONS,
	isHostedBatchAction
} = require("../hostedVirtualOs/hostedBatchActions.js");

/**
 * The Awtsmoos carries trusted identity through a nested deed without letting
 * the outer vessel erase the inner law. Awtsmoos.com must let older AI clients
 * publish through batches while ordinary filesystem work remains ordinary.
 */
test("hosted batches re-enter publication and filesystem dispatch", async () => {
	const trustedContext = { request: "trusted" };
	const calls = [];
	const dependencies = {
		dispatchSitePublication: async ($i, userId, payload) => {
			calls.push(["publication", $i, userId, payload.action]);
			return { ok: true, canonicalPath: "/sites/asdf/orbit/" };
		},
		dispatchOsFs: async ($i, userId, payload) => {
			calls.push(["os", $i, userId, payload.action]);
			return { ok: true, content: "light" };
		}
	};

	const result = await dispatchHostedVirtualOs(
		trustedContext,
		"alice",
		{
			action: "actionBatch",
			actions: [
				{ action: "sitePublicationStatus", aliasId: "asdf", siteId: "orbit" },
				{ action: "read", path: "asdf/sites/orbit/index.html" }
			]
		},
		dependencies
	);

	assert.equal(result.ok, true);
	assert.equal(result.count, 2);
	assert.deepEqual(calls, [
		["publication", trustedContext, "alice", "sitePublicationStatus"],
		["os", trustedContext, "alice", "read"]
	]);
});

test("all compatibility batch aliases stay inside hosted dispatch", () => {
	assert.deepEqual(HOSTED_BATCH_ACTIONS, [
		"actionBatch",
		"workflowRun",
		"commandBatch",
		"aiCommandBatch"
	]);

	for (const action of HOSTED_BATCH_ACTIONS) {
		assert.equal(isHostedBatchAction(action), true);
	}
	assert.equal(isHostedBatchAction("read"), false);
});
